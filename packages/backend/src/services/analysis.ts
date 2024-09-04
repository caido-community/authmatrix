import type { SDK } from "caido:plugin";
import type { RequestSpec } from "caido:utils";

import { TemplateStore } from "../stores/templates";
import { UserStore } from "../stores/users";

import type { AnalysisResult, Template, User, UserAttribute } from "shared";
import { AnalysisStore } from "../stores/analysis";
import { Uint8ArrayToString } from "../utils";

import type {BackendEvents} from "../types";

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

  const users = userStore.getUsers();
  const templates = templateStore.getTemplates();

  sdk.console.debug(
    `Analyzing ${templates.length} templates with ${users.length} users`,
  );

  const promises = templates.map((template) => {
    return users.map((user) => {
      return analyzeRequest(sdk, template, user);
    });
  });

  await Promise.all(promises);
};

const analyzeRequest = async (sdk: SDK<never, BackendEvents>, template: Template, user: User) => {
  const { request: baseRequest } = await sdk.requests.get(template.requestId) ?? {};

  if (!baseRequest) {
    sdk.console.error(`Request not found for template ${template.id}`);
    return;
  }

  const spec = setAttributes(baseRequest.toSpec(), user.attributes);

  sdk.console.debug(`Sending request ${spec}`);
  const { request, response } = await sdk.requests.send(spec);
  const shouldHaveAccess = template.rules.some((rule) => {
    return user.roleIds.includes(roleId);
  });

  const requestId = request.getId();
  const analysisResult: AnalysisResult = {
    id: `${template.id}-${user.id}-${requestId}`,
    templateId: template.id,
    userId: user.id,
    requestId,
    //status: "Unexpected"
  }

  const responseRaw = response.getRaw().toText();
  const hasAccess = responseRaw.match(template.authSuccessRegex);

  const store = AnalysisStore.get();
  if (!shouldHaveAccess && hasAccess) {
    //analysisResult.status = "Bypassed";
    store.addResult(analysisResult);
    sdk.api.send("results:created", analysisResult);
    return;
  }

  if ((shouldHaveAccess && hasAccess) || (!shouldHaveAccess && !hasAccess)) {
    //analysisResult.status = "Enforced";
    store.addResult(analysisResult);
    sdk.api.send("results:created", analysisResult);
    return;
  }

  if (shouldHaveAccess && !hasAccess) {
    //analysisResult.status = "Unexpected";
    store.addResult(analysisResult);
    sdk.api.send("results:created", analysisResult);
    return;
  }
};

const setAttributes = (spec: RequestSpec, attributes: UserAttribute[]) => {
  const newHeaders = attributes.filter((attr) => attr.kind === "Header");
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

  // Set headers
  for (const newHeader of newHeaders) {
    spec.setHeader(newHeader.name, newHeader.value);
  }

  return spec;
}
