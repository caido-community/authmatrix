import type { SDK } from "caido:plugin";
import type { RequestSpec } from "caido:utils";

import { TemplateStore } from "../stores/templates";
import { UserStore } from "../stores/users";

import type {
  AnalysisRequestDTO,
  RuleStatusDTO,
  TemplateDTO,
  UserAttributeDTO,
  UserDTO,
} from "shared";
import { AnalysisStore } from "../stores/analysis";
import { Uint8ArrayToString, isPresent } from "../utils";

import { RoleStore } from "../stores/roles";
import type { BackendEvents } from "../types";

export const getResults = (_sdk: SDK): AnalysisRequestDTO[] => {
  const store = AnalysisStore.get();
  return store.getResults();
};

export const getRequestResponse = async (sdk: SDK, requestId: string) => {
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
};

export const runAnalysis = async (sdk: SDK<never, BackendEvents>) => {
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

  sdk.console.debug(
    `Analyzing ${templates.length} templates with ${users.length} users`,
  );

  for (const template of templates) {
    // Run each template async
    (async () => {
      for (const user of users) {
        if (analysisStore.resultExists(template.id, user.id)) {
          continue;
        }
        const analysisRequest = await sendRequest(sdk, template, user);
        if (analysisRequest) {
          analysisStore.addRequest(analysisRequest);
          sdk.api.send("results:created", analysisRequest);
        }
      }

      const newRules: TemplateDTO["rules"] = [];
      const roles = roleStore.getRoles();
      const rolePromises = roles.map(async (role) => {
        const currentRule = template.rules.find(
          (rule) => rule.type === "RoleRule" && rule.roleId === role.id,
        ) ?? {
          type: "RoleRule",
          roleId: role.id,
          hasAccess: false,
          status: "Untested",
        };
  
  
        if (currentRule.status !== "Untested") {
          return currentRule;
        }
  
        const status = await generateRoleRuleStatus(sdk, template, role.id);
        return { ...currentRule, status };
      });

      const userPromises = users.map(async (user) => {
        const currentRule = template.rules.find(
          (rule) => rule.type === "UserRule" && rule.userId === user.id,
        ) ?? {
          type: "UserRule",
          userId: user.id,
          hasAccess: false,
          status: "Untested",
        };

        if (currentRule.status !== "Untested") {
          return currentRule;
        }

        const status = await generateUserRuleStatus(sdk, template, user);
        return { ...currentRule, status };
      });

      const roleResults = await Promise.all(rolePromises);
      const userResults = await Promise.all(userPromises);

      // Combine results
      newRules.push(...roleResults, ...userResults);

      template.rules = newRules;
      templateStore.updateTemplate(template.id, template);
      sdk.api.send("templates:updated", template);
    })()
  }
};

const sendRequest = async (sdk: SDK, template: TemplateDTO, user: UserDTO) => {
  const { request: baseRequest } =
    (await sdk.requests.get(template.requestId)) ?? {};

  if (!baseRequest) {
    sdk.console.error(`Request not found for template ${template.id}`);
    return;
  }

  const spec = baseRequest.toSpec();
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
      const { response } = (await sdk.requests.get(result.requestId)) ?? {};
      return response;
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
      const { response } = (await sdk.requests.get(result.requestId)) ?? {};
      return response;
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
