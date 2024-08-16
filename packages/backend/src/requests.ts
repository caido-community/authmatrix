import type { SDK } from "caido:plugin";
import type { Request, Response } from "caido:utils";
import type { BaseRequest } from "shared";
import { generateID } from "./utils";

const requests: BaseRequest[] = [];

export const getRequests = (_sdk: SDK): BaseRequest[] => {
	return requests;
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

	requests.push(newRequest);

	return newRequest;
};

export const deleteRequest = (sdk: SDK, requestId: string) => {
	const index = requests.findIndex((request) => request.id === requestId);
	if (index !== -1) {
		requests.splice(index, 1);
	}
};

export const toggleRequestRole = (
	sdk: SDK,
	requestId: string,
	roleId: string,
) => {
	const request = requests.find((request) => request.id === requestId);
	if (request) {
		if (request.roleIds.includes(roleId)) {
			request.roleIds = request.roleIds.filter((id) => id !== roleId);
		} else {
			request.roleIds.push(roleId);
		}

		return request;
	}
};

export const toggleRequestUser = (
	sdk: SDK,
	requestId: string,
	userId: string,
) => {
	const request = requests.find((request) => request.id === requestId);
	if (request) {
		if (request.userIds.includes(userId)) {
			request.userIds = request.userIds.filter((id) => id !== userId);
		} else {
			request.userIds.push(userId);
		}

		return request;
	}
};

export const onInterceptResponse = async (
	sdk: SDK,
	request: Request,
	response: Response,
) => {
	requests.push({
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
