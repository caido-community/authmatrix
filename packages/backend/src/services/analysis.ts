import type { SDK } from "caido:plugin";

import {RequestStore} from "../stores/requests";
import {UserStore} from "../stores/users";


import type { BaseRequest, User } from "shared";
import {RequestSpec} from "caido:utils";

export const runAnalysis = async (sdk: SDK) => {
  const requestStore = RequestStore.get();
  const userStore = UserStore.get();

  const users = userStore.getUsers();
  const requests = requestStore.getRequests();

  sdk.console.debug(`Analyzing ${requests.length} requests with ${users.length} users`);
  const promises = requests.map((request) => {
    return users.map((user) => {
      return analyzeRequest(sdk, request, user);
    });
  });

  await Promise.all(promises);
}

const analyzeRequest = async (sdk: SDK, request: BaseRequest, user: User) => {
  // Retrieve RequestSpec given an ID
  // Here we mock this behavior as we don't have a real implementation yet
  const protocol = request.meta.isTls ? "https" : "http";
  const connectionURL = `${protocol}://${request.meta.host}:${request.meta.port}`;
  const spec = new RequestSpec(connectionURL);

  const newHeaders = user.attributes.filter((attr) => attr.kind === "Header");
  const newCookies = user.attributes.filter((attr) => attr.kind === "Cookie");

  // Set cookies
  const cookies: Record<string, string> = {};
  const cookieString = spec.getHeader("Cookie")?.join("; ") ?? "";

  for (const cookie of cookieString.split("; ")) {
    const [name, value] = cookie.split("=", 2);
    if (typeof name === "string" && typeof value === "string") {
      cookies[name] = value;
    }
  };

  for (const newCookie of newCookies) {
    cookies[newCookie.name] = newCookie.value;
  }

  const newCookieString = Object.entries(cookies).map(([name, value]) => {
    return `${name}=${value}`;
  }).join("; ");

  spec.setHeader("Cookie", newCookieString);

  // Set headers
  for (const newHeader of newHeaders) {
    spec.setHeader(newHeader.name, newHeader.value);
  }

  sdk.console.debug(`Sending request ${spec}`);
  const result = await sdk.requests.send(spec);
  const hasAccess = request.roleIds.some((roleId) => {
    return user.roleIds.includes(roleId);
  });

  // Check if the user is supposed to have access to the request
  if (!hasAccess && result.response.getCode() === 200) {

    // User is not supposed to have access
    return;
  }
};
