import type { SDK } from "caido:plugin";
import type { ID, Request, Response } from "caido:utils";
import type { TemplateDTO } from "shared";

import { TemplateStore } from "../stores/templates";
import { generateID, sha256Hash } from "../utils";

import { SettingsStore } from "../stores/settings";
import type { BackendEvents } from "../types";
import { runAnalysis } from "./analysis";

export const getTemplates = (_sdk: SDK): TemplateDTO[] => {
  const store = TemplateStore.get();
  return store.getTemplates();
};

export const addTemplate = (sdk: SDK<never, BackendEvents>) => {
  const newTemplate: TemplateDTO = {
    id: generateID(),
    requestId: generateID(),
    authSuccessRegex: "HTTP/1[.]1 200",
    rules: [],
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

export const updateTemplate = (
  sdk: SDK<never, BackendEvents>,
  id: string,
  fields: Omit<TemplateDTO, "id">,
) => {
  const store = TemplateStore.get();
  const newTemplate = store.updateTemplate(id, fields);
  sdk.api.send("templates:updated", newTemplate);
  return newTemplate;
};

export const toggleTemplateRole = (
  sdk: SDK<never, BackendEvents>,
  requestId: string,
  roleId: string,
) => {
  const store = TemplateStore.get();
  const newTemplate = store.toggleTemplateRole(requestId, roleId);
  sdk.api.send("templates:updated", newTemplate);
  return newTemplate;
};

export const toggleTemplateUser = (
  sdk: SDK<never, BackendEvents>,
  requestId: string,
  userId: string,
) => {
  const store = TemplateStore.get();
  const newTemplate = store.toggleTemplateUser(requestId, userId);
  sdk.api.send("templates:updated", newTemplate);
  return newTemplate;
};

export const clearTemplates = (sdk: SDK<never, BackendEvents>) => {
  const store = TemplateStore.get();
  store.clearTemplates();
  sdk.api.send("templates:cleared");
};

export const onInterceptResponse = async (
  sdk: SDK<never, BackendEvents>,
  request: Request,
  response: Response,
) => {
  const settingsStore = SettingsStore.get();
  const settings = settingsStore.getSettings();
  const store = TemplateStore.get();

  if (settings.autoCaptureRequests == "off") {
    return;
  }
  
  if (!sdk.requests.matches(settings.defaultFilterHTTPQL, request)) {
    sdk.console.log(`Filtering: ${request.getUrl()}`)
    return;
  }

  const templateId = generateTemplateId(request, settings.deDuplicateHeaders);
  if (store.templateExists(templateId)) {
    return
  }

  switch (settings.autoCaptureRequests) {
    case "all": {
      const template = toTemplate(request, response, templateId);
      store.addTemplate(template);
      sdk.api.send("templates:created", template);
      break;
    }
    case "inScope": {
      if (sdk.requests.inScope(request)) {
        const template = toTemplate(request, response, templateId);
        store.addTemplate(template);
        sdk.api.send("templates:created", template);
      }
      break;
    }
  }
  if (settings.autoRunAnalysis) {
    runAnalysis(sdk);
  }
};

export const addTemplateFromContext = async (
  sdk: SDK<never, BackendEvents>,
  request_id: ID,
) => {
  const settingsStore = SettingsStore.get();
  const settings = settingsStore.getSettings();
  const store = TemplateStore.get();

  const result = await sdk.requests.get(request_id.toString())
  if (!result) {
    return;
  }
  const request = result.request;
  const response = result.response;
  if(!request || !response) {
    return;
  }

  const templateId = generateTemplateId(request, settings.deDuplicateHeaders);
  if (store.templateExists(templateId)) {
    return
  }

  const template = toTemplate(request, response, templateId);
  store.addTemplate(template);
  sdk.api.send("templates:created", template);
}

export const registerTemplateEvents = (sdk: SDK) => {
  sdk.events.onInterceptResponse(onInterceptResponse);
};


const generateTemplateId = (request: Request, dedupeHeaders: string[] = []): string => {
  let body = request.getBody()?.toText();
  if (!body) {
    body = "";
  }
  const bodyHash = sha256Hash(body);
  let dedupe = `${request.getMethod}~${request.getUrl()}~${bodyHash}`;
  dedupeHeaders.forEach((h) => {
    dedupe += `~${request.getHeader(h)?.join("~")}`
  })
  return sha256Hash(dedupe)
}

const toTemplate = (request: Request, response: Response, templateId: string = generateTemplateId(request)): TemplateDTO => {
  return {
    id: templateId,
    requestId: request.getId(),
    authSuccessRegex: `HTTP/1[.]1 ${response.getCode()}`,
    rules: [],
    meta: {
      host: request.getHost(),
      port: request.getPort(),
      method: request.getMethod(),
      isTls: request.getTls(),
      path: request.getPath(),
    },
  };
};
