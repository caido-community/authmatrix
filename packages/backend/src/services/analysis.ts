import type { SDK } from "caido:plugin";
import { RequestSpec } from "caido:utils";
import type {
  AnalysisRequestDTO,
  RuleStatusDTO,
  TemplateDTO,
  UserAttributeDTO,
  UserDTO,
} from "shared";

import { withProject } from "../db/utils";
import { updateTemplateFields } from "../repositories/templates";
import { AnalysisStore } from "../stores/analysis";
import { RoleStore } from "../stores/roles";
import { SubstitutionStore } from "../stores/substitutions";
import { TemplateStore } from "../stores/templates";
import { UserStore } from "../stores/users";
import type { BackendEvents } from "../types";
import { isPresent, Uint8ArrayToString } from "../utils";

export const getResults = (_sdk: SDK): AnalysisRequestDTO[] => {
  const store = AnalysisStore.get();
  return store.getResults();
};

export const getRequestResponse = async (sdk: SDK, requestId: string) => {
  if (typeof requestId !== "string" || requestId.trim() === "") {
    return { type: "Err" as const, message: "Invalid request id" };
  }

  try {
    const result = await sdk.requests.get(requestId);
    if (!result) {
      return { type: "Err" as const, message: "Request not found" };
    }

    const { request, response } = result;

    return {
      type: "Ok" as const,
      request: {
        id: request.getId(),
        raw: Uint8ArrayToString(request.toSpecRaw().getRaw()),
      },
      response: response
        ? {
            id: response.getId(),
            raw: response.getRaw().toText(),
          }
        : undefined,
    };
  } catch (_e) {
    return { type: "Err" as const, message: "Request not found" };
  }
};

export const runAnalysis = async (sdk: SDK<never, BackendEvents>) => {
  const project = await sdk.projects.getCurrent();
  if (!project) return;

  const templateStore = TemplateStore.get();
  const userStore = UserStore.get();
  const roleStore = RoleStore.get();
  const analysisStore = AnalysisStore.get();

  // Clear current results
  analysisStore.clearRequests();
  sdk.api.send("results:clear");

  // Send requests
  const templates = templateStore.getTemplates();
  const users = userStore.getUsers();
  const roles = roleStore.getRoles();

  sdk.console.debug(
    `Analyzing ${templates.length} templates with ${users.length} users`,
  );

  // Process templates in batches of 5
  const batchSize = 5;
  for (let i = 0; i < templates.length; i += batchSize) {
    const batch = templates.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (template) => {
        sdk.api.send("cursor:mark", template.id, true);

        for (const user of users) {
          if (analysisStore.resultExists(template.id, user.id)) {
            sdk.api.send("cursor:mark", template.id, false);
            continue;
          }

          const analysisRequest = await sendRequest(sdk, template, user);
          if (analysisRequest !== undefined) {
            analysisStore.addRequest(analysisRequest);
            sdk.api.send("results:created", analysisRequest);
          }
        }

        const newRules: TemplateDTO["rules"] = [];

        for (const role of roles) {
          const currentRule = template.rules.find(
            (rule) => rule.type === "RoleRule" && rule.roleId === role.id,
          ) ?? {
            type: "RoleRule",
            roleId: role.id,
            hasAccess: false,
            status: "Untested",
          };

          const status = await generateRoleRuleStatus(sdk, template, role.id);
          newRules.push({ ...currentRule, status });
        }

        for (const user of users) {
          const currentRule = template.rules.find(
            (rule) => rule.type === "UserRule" && rule.userId === user.id,
          ) ?? {
            type: "UserRule",
            userId: user.id,
            hasAccess: false,
            status: "Untested",
          };

          const status = await generateUserRuleStatus(sdk, template, user);
          newRules.push({ ...currentRule, status });
        }

        template.rules = newRules;
        templateStore.updateTemplate(template.id, template);

        await withProject(sdk, async (projectId) => {
          await updateTemplateFields(sdk, projectId, template.id, template);
          sdk.api.send("templates:updated", template);
          sdk.api.send("cursor:mark", template.id, false);
        });
      }),
    );
  }

  sdk.api.send("cursor:clear");
};

export const applySubstitutions = (path: string): string => {
  const substitutionStore = SubstitutionStore.get();
  const substitutions = substitutionStore.getSubstitutions();

  console.log(`Available substitutions: ${substitutions.length}`);
  substitutions.forEach((sub, index) => {
    console.log(
      `Substitution ${index}: "${sub.pattern}" -> "${sub.replacement}"`,
    );
  });

  let result = path;
  for (const sub of substitutions) {
    const beforeReplace = result;
    result = result.replace(
      new RegExp(sub.pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      sub.replacement,
    );
    if (beforeReplace !== result) {
      console.log(
        `Substitution applied: "${sub.pattern}" -> "${sub.replacement}"`,
      );
      console.log(`Path changed from: "${beforeReplace}" to: "${result}"`);
    }
  }
  return result;
};

const sendRequest = async (sdk: SDK, template: TemplateDTO, user: UserDTO) => {
  const scheme = template.meta.isTls ? "https" : "http";
  const needsPort = !(
    (template.meta.isTls && template.meta.port === 443) ||
    (!template.meta.isTls && template.meta.port === 80)
  );
  const portPart = needsPort ? `:${template.meta.port}` : "";
  // Path already has substitutions applied during import, just use it directly
  console.log(`Using path from template: "${template.meta.path}"`);
  const url = `${scheme}://${template.meta.host}${portPart}${template.meta.path}`;
  console.log(`Final URL: "${url}"`);

  const spec = new RequestSpec(url);
  spec.setMethod(template.meta.method);
  setCookies(spec, user.attributes);
  setHeaders(spec, user.attributes);

  const { request } = await sdk.requests.send(spec);

  const requestId = request.getId();
  const analysisRequest: AnalysisRequestDTO = {
    id: `${template.id}-${user.id}-${requestId}`,
    templateId: template.id,
    userId: user.id,
    requestId,
  };

  return analysisRequest;
};

const setCookies = (spec: RequestSpec, attributes: UserAttributeDTO[]) => {
  const newCookies = attributes.filter((attr) => attr.kind === "Cookie");
  if (newCookies.length === 0) {
    return spec;
  }

  // Set cookies
  const cookies: Record<string, string> = {};
  const cookieString = spec.getHeader("Cookie")?.join("; ") ?? "";

  for (const cookie of cookieString.split("; ")) {
    const [name, value] = cookie.split("=", 2);
    if (typeof name === "string" && typeof value === "string") {
      cookies[name] = value;
    }
  }

  for (const newCookie of newCookies) {
    cookies[newCookie.name] = newCookie.value;
  }

  const newCookieString = Object.entries(cookies)
    .map(([name, value]) => {
      return `${name}=${value}`;
    })
    .join("; ");

  spec.setHeader("Cookie", newCookieString);

  return spec;
};

const setHeaders = (spec: RequestSpec, attributes: UserAttributeDTO[]) => {
  const newHeaders = attributes.filter((attr) => attr.kind === "Header");

  // Set headers
  for (const newHeader of newHeaders) {
    spec.setHeader(newHeader.name, newHeader.value);
  }

  return spec;
};

const generateRoleRuleStatus = async (
  sdk: SDK,
  template: TemplateDTO,
  roleId: string,
): Promise<RuleStatusDTO> => {
  const store = AnalysisStore.get();
  const userStore = UserStore.get();

  // Get all users with the role
  const users = userStore
    .getUsers()
    .filter((user) => user.roleIds.includes(roleId));

  // Get all results for this template and matching users
  const results = store.getResults();
  const templateResults = results.filter((result) => {
    return (
      result.templateId === template.id &&
      users.some((user) => user.id === result.userId)
    );
  });

  // Get the rule for the role
  const rule = template.rules.find(
    (rule) => rule.type === "RoleRule" && rule.roleId === roleId,
  ) ?? {
    type: "RoleRule",
    roleId,
    hasAccess: false,
    status: "Untested",
  };

  // Get all result responses
  const responses = await Promise.all(
    templateResults.map(async (result) => {
      try {
        const fetched = await sdk.requests.get(result.requestId);
        return fetched?.response;
      } catch (_e) {
        return undefined;
      }
    }),
  );

  // If any response is not found, return "Unexpected"
  const filteredResponses = responses.filter(isPresent);
  if (filteredResponses.length !== responses.length) {
    return "Unexpected";
  }

  // Get all responses access state
  const regex = new RegExp(template.authSuccessRegex);
  const accessStates = filteredResponses.map((response) => {
    return regex.test(response.getRaw().toText());
  });

  // If all access states match the rule, return "Enforced"
  if (accessStates.every((hasAccess) => hasAccess === rule.hasAccess)) {
    return "Enforced";
  }

  // If any access state is false, but the rule is true, return "Unexpected"
  if (rule.hasAccess && accessStates.some((hasAccess) => !hasAccess)) {
    return "Unexpected";
  }

  // If any access state is true, but the rule is false, return "Bypassed"
  if (!rule.hasAccess && accessStates.some((hasAccess) => hasAccess)) {
    return "Bypassed";
  }

  return "Unexpected";
};

const generateUserRuleStatus = async (
  sdk: SDK,
  template: TemplateDTO,
  user: UserDTO,
): Promise<RuleStatusDTO> => {
  const store = AnalysisStore.get();

  // Get all results for this template and matching user
  const results = store.getResults().filter((result) => {
    return result.templateId === template.id && result.userId === user.id;
  });

  // Check if user should have access to this resource
  const hasAccess = template.rules.some((rule) => {
    if (rule.type === "RoleRule") {
      return rule.hasAccess && user.roleIds.includes(rule.roleId);
    }

    return rule.hasAccess && rule.userId === user.id;
  });

  // Get all result responses
  const responses = await Promise.all(
    results.map(async (result) => {
      try {
        const fetched = await sdk.requests.get(result.requestId);
        return fetched?.response;
      } catch (_e) {
        return undefined;
      }
    }),
  );

  // If any response is not found, return "Unexpected"
  const filteredResponses = responses.filter(isPresent);
  if (filteredResponses.length !== responses.length) {
    return "Unexpected";
  }

  // Get all responses access state
  const regex = new RegExp(template.authSuccessRegex);
  const accessStates = filteredResponses.map((response) => {
    return regex.test(response.getRaw().toText());
  });

  // If all access states match the rule, return "Enforced"
  if (accessStates.every((resultAccess) => resultAccess === hasAccess)) {
    return "Enforced";
  }

  // If any access state is false, but the rule is true, return "Unexpected"
  if (hasAccess && accessStates.some((hasAccess) => !hasAccess)) {
    return "Unexpected";
  }

  // If any access state is true, but the rule is false, return "Bypassed"
  if (!hasAccess && accessStates.some((hasAccess) => hasAccess)) {
    return "Bypassed";
  }

  return "Unexpected";
};
