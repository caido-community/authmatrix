import type { SDK } from "caido:plugin";
import type { Request, Response } from "caido:utils";
import type { BaseRequest } from "shared";

import { generateID } from "../utils";
import {RequestStore} from "../stores/requests";

import type { BackendEvents } from "../types";

export const getRequests = (_sdk: SDK): BaseRequest[] => {
  const store = RequestStore.get();
  return store.getRequests();
};

export const addRequest = (sdk: SDK<never, BackendEvents>) => {
	const newRequest: BaseRequest = {
		id: generateID(),
    authSuccessRegex: "HTTP/1[.]1 200",
		roleIds: [],
		userIds: [],
    meta: {
      host: "localhost",
      port: 10134,
      path: "/",
      isTls: false,
      method: "GET",
    },
	};

  const store = RequestStore.get();
  store.addRequest(newRequest);
  sdk.api.send("requests:created", newRequest);

	return newRequest;
};

export const deleteRequest = (_sdk: SDK, requestId: string) => {
  const store = RequestStore.get();
  store.deleteRequest(requestId);
};

export const toggleRequestRole = (
	_sdk: SDK,
	requestId: string,
	roleId: string,
) => {

  const store = RequestStore.get();
  return store.toggleRequestRole(requestId, roleId);
};

export const toggleRequestUser = (
	_sdk: SDK,
	requestId: string,
	userId: string,
) => {
  const store = RequestStore.get();
  return store.toggleRequestUser(requestId, userId);
};

export const onInterceptResponse = async (
	sdk: SDK<never, BackendEvents>,
	request: Request,
	response: Response,
) => {

  const baseRequest: BaseRequest = {
    id: request.getId(),
    authSuccessRegex: `HTTP/1[.]1 ${response.getCode()}`,
    roleIds: [],
    userIds: [],
    meta: {
      host: request.getHost(),
      port: request.getPort(),
      method: request.getMethod(),
      isTls: request.getTls(),
      path: request.getPath(),
    },
  }

  const store = RequestStore.get();
  store.addRequest(baseRequest);
  sdk.api.send("requests:created", baseRequest);
};

export const registerRequestEvents = (sdk: SDK) => {
	sdk.events.onInterceptResponse(onInterceptResponse);
  sdk.events.onInterceptRequest((sdk, request: Request) => {
    request
  })
};
