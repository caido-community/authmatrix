import type { SDK } from "caido:plugin";
import type { RequestSpec } from "caido:utils";

import { TemplateStore } from "../stores/templates";
import { UserStore } from "../stores/users";

import type { AnalysisResult, RuleStatus, Template, User, UserAttribute } from "shared";
import { AnalysisStore } from "../stores/analysis";
import { Uint8ArrayToString, isPresent } from "../utils";

import type {BackendEvents} from "../types";
import {RoleStore} from "../stores/roles";

export const getResults = (_sdk: SDK): AnalysisResult[] => {
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
  const analysisStore = AnalysisStore.get()

  // Clear current results
  analysisStore.clearResults();
  sdk.api.send("results:clear");

  // Send requests
  const templates = templateStore.getTemplates();
  const users = userStore.getUsers();

  sdk.console.debug(
    `Analyzing ${templates.length} templates with ${users.length} users`,
  );

  for (const template of templates) {
    for (const user of users) {
      const analysisResult = await sendRequest(sdk, template, user);
      if (analysisResult) {
        analysisStore.addResult(analysisResult);
        sdk.api.send("results:created", analysisResult);
      }
    }
  }

  const roles = roleStore.getRoles();
  for (const template of templates) {
    const newRules: Template["rules"] = [];

    // Generate role rule statuses in parallel
    const rolePromises = roles.map(async (role) => {
      const currentRule = template.rules.find(
        (rule) => rule.type === "RoleRule" && rule.roleId === role.id
      ) ?? {
        type: "RoleRule",
        roleId: role.id,
        hasAccess: false,
        status: "Untested",
      };

      const status = await generateRoleRuleStatus(sdk, template, role.id);
      return { ...currentRule, status };
    });

    // Generate user rule statuses in parallel
    const userPromises = users.map(async (user) => {
      const currentRule = template.rules.find(
        (rule) => rule.type === "UserRule" && rule.userId === user.id
      ) ?? {
        type: "UserRule",
        userId: user.id,
        hasAccess: false,
        status: "Untested",
      };

      const status = await generateUserRuleStatus(sdk, template, user);
      return { ...currentRule, status };
    });

    // Await all role and user statuses
    const roleResults = await Promise.all(rolePromises);
    const userResults = await Promise.all(userPromises);

    // Combine results
    newRules.push(...roleResults, ...userResults);

    template.rules = newRules;
    templateStore.updateTemplate(template.id, template);
    sdk.api.send("templates:updated", template);
  }
};

const sendRequest = async (sdk: SDK, template: Template, user: User) => {
  const { request: baseRequest } = await sdk.requests.get(template.requestId) ?? {};

  if (!baseRequest) {
    sdk.console.error(`Request not found for template ${template.id}`);
    return;
  }

  const spec = baseRequest.toSpec();
  setCookies(spec, user.attributes);
  setHeaders(spec, user.attributes);

  const { request } = await sdk.requests.send(spec);

  const requestId = request.getId();
  const analysisResult: AnalysisResult = {
    id: `${template.id}-${user.id}-${requestId}`,
    templateId: template.id,
    userId: user.id,
    requestId,
  }

  return analysisResult;
};


const setCookies = (spec: RequestSpec, attributes: UserAttribute[]) => {
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
}

const setHeaders = (spec: RequestSpec, attributes: UserAttribute[]) => {
  const newHeaders = attributes.filter((attr) => attr.kind === "Header");

  // Set headers
  for (const newHeader of newHeaders) {
    spec.setHeader(newHeader.name, newHeader.value);
  }

  return spec;
}

const generateRoleRuleStatus = async (sdk: SDK, template: Template, roleId: string): Promise<RuleStatus> => {
  const store = AnalysisStore.get();
  const userStore = UserStore.get();

  // Get all users with the role
  const users = userStore.getUsers().filter((user) => user.roleIds.includes(roleId));

  // Get all results for this template and matching users
  const results = store.getResults();
  const templateResults = results.filter((result) => {
    return result.templateId === template.id && users.some((user) => user.id === result.userId)
  });

  // Get the rule for the role
  const rule = template.rules.find((rule) => rule.type === "RoleRule" && rule.roleId === roleId) ?? {
    type: "RoleRule",
    roleId,
    hasAccess: false,
    status: "Untested",
  };

  // Get all result responses
  const responses = await Promise.all(templateResults.map(async (result) => {
    const { response } = await sdk.requests.get(result.requestId) ?? {};
    return response;
  }));

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
}

const generateUserRuleStatus = async (sdk: SDK, template: Template, user: User): Promise<RuleStatus> => {
  const store = AnalysisStore.get();

  // Get all results for this template and matching user
  const results = store.getResults().filter((result) => {
    return result.templateId === template.id && result.userId === user.id;
  });

  // Check if user should have access to this resource
  const hasAccess = template.rules.some((rule) => {
    if (rule.type === "RoleRule") {
      return rule.hasAccess && user.roleIds.includes(rule.roleId)
    }

    return rule.hasAccess && rule.userId === user.id;
  })

  // Get all result responses
  const responses = await Promise.all(results.map(async (result) => {
    const { response } = await sdk.requests.get(result.requestId) ?? {};
    return response;
  }));

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
}
