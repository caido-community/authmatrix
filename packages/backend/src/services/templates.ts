import type { SDK } from "caido:plugin";
import type { Request, Response } from "caido:utils";
import type { Template } from "shared";

import { generateID } from "../utils";
import {TemplateStore} from "../stores/templates";

import type { BackendEvents } from "../types";

export const getTemplates = (_sdk: SDK): Template[] => {
  const store = TemplateStore.get();
  return store.getTemplates();
};

export const addTemplate = (sdk: SDK<never, BackendEvents>) => {
	const newTemplate: Template = {
		id: generateID(),
    requestId: generateID(),
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

  const store = TemplateStore.get();
  store.addTemplate(newTemplate);
  sdk.api.send("templates:created", newTemplate);

	return newTemplate;
};

export const deleteTemplate = (_sdk: SDK, requestId: string) => {
  const store = TemplateStore.get();
  store.deleteTemplate(requestId);
};

export const toggleTemplateRole = (
	_sdk: SDK,
	requestId: string,
	roleId: string,
) => {

  const store = TemplateStore.get();
  return store.toggleTemplateRole(requestId, roleId);
};

export const toggleTemplateUser = (
	_sdk: SDK,
	requestId: string,
	userId: string,
) => {
  const store = TemplateStore.get();
  return store.toggleTemplateUser(requestId, userId);
};

export const onInterceptResponse = async (
	sdk: SDK<never, BackendEvents>,
	request: Request,
	response: Response,
) => {

  const template: Template = {
    id: generateID(),
    requestId: request.getId(),
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

  const store = TemplateStore.get();
  store.addTemplate(template);
  sdk.api.send("templates:created", template);
};

export const registerTemplateEvents = (sdk: SDK) => {
	sdk.events.onInterceptResponse(onInterceptResponse);
};
