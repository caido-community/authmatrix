import type { SDK } from "caido:plugin";
import type { Request, Response } from "caido:utils";
import type { BaseRequest } from "shared";

import { generateID } from "../utils";
import {RequestStore} from "../stores/requests";

export const getRequests = (_sdk: SDK): BaseRequest[] => {
  const store = RequestStore.get();
  return store.getRequests();
};

export const addRequest = (sdk: SDK) => {
	const newRequest: BaseRequest = {
		id: generateID(),
		host: "localhost",
		port: 10134,
		path: "/",
		isTls: false,
		method: "GET",
		roleIds: [],
		userIds: [],
	};

  const store = RequestStore.get();
  store.addRequest(newRequest);

	return newRequest;
};

export const deleteRequest = (sdk: SDK, requestId: string) => {
  const store = RequestStore.get();
  store.deleteRequest(requestId);
};

export const toggleRequestRole = (
	sdk: SDK,
	requestId: string,
	roleId: string,
) => {

  const store = RequestStore.get();
  return store.toggleRequestRole(requestId, roleId);
};

export const toggleRequestUser = (
	sdk: SDK,
	requestId: string,
	userId: string,
) => {
  const store = RequestStore.get();
  return store.toggleRequestUser(requestId, userId);
};

export const onInterceptResponse = async (
	sdk: SDK,
	request: Request,
	response: Response,
) => {
  const store = RequestStore.get();
  store.addRequest({
    id: request.getId(),
    host: request.getHost(),
    port: request.getPort(),
    method: request.getMethod(),
    isTls: request.getTls(),
    path: request.getPath(),
    roleIds: [],
    userIds: [],
  });
};

export const registerRequestEvents = (sdk: SDK) => {
	sdk.events.onInterceptResponse(onInterceptResponse);
};
