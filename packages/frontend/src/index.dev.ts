import type { API } from "backend";
import type { AnalysisResult, Template, User } from "shared";
import { defineApp } from "./app";
import type { CaidoSDK } from "./types";
import { clone } from "./utils";

// This is a mock backend for the SDK
// This is only for development purposes
const templates: Template[] = [
  {
    id: "1",
    requestId: "1",
    authSuccessRegex: "HTTP/1[.]1 200",
    meta: {
      method: "GET",
      host: "localhost",
      path: "/",
      port: 80,
      isTls: false,
    },
    roleIds: [],
    userIds: [],
  },
];

const results: AnalysisResult[] = [
  {
    id: "1",
    userId: "1",
    requestId: "1",
    templateId: "1",
    status: "Enforced",
  },
];

const users: User[] = [
  {
    id: "1",
    name: "admin",
    roleIds: [],
    attributes: [],
  },
];

const backend: API & Record<string, unknown> = {
  onEvent: () => {},
  getRoles: () => {
    return [];
  },
  addRole: (name) => {
    return {
      id: Math.random().toString(),
      name,
      description: "",
    };
  },
  updateRole: (id, fields) => {
    return clone({
      id,
      ...fields,
    });
  },
  deleteRole: (id) => {},
  getUsers: () => {
    return users;
  },
  addUser: (name) => {
    return {
      id: Math.random().toString(),
      name,
      roleIds: [],
      attributes: [],
    };
  },
  updateUser: (id, fields) => {
    return clone({
      id,
      ...fields,
    });
  },
  deleteUser: (id) => {},
  getTemplates: () => {
    return templates;
  },
  addTemplate: () => {
    const newTemplate = {
      id: Math.random().toString(),
      requestId: "1",
      authSuccessRegex: "HTTP/1[.]1 200",
      meta: {
        method: "GET",
        host: "localhost",
        path: "/",
        port: 80,
        isTls: false,
      },
      roleIds: [],
      userIds: [],
    };

    templates.push(newTemplate);

    return newTemplate;
  },
  deleteTemplate: (id) => {
    const index = templates.findIndex((request) => request.id === id);
    if (index !== -1) {
      templates.splice(index, 1);
    }
  },
  toggleTemplateRole: (requestId, roleId) => {
    const request = templates.find((request) => request.id === requestId);

    if (request) {
      const newTemplate = clone(request);
      const isEnabled = newTemplate.roleIds.includes(roleId);

      if (isEnabled) {
        newTemplate.roleIds = newTemplate.roleIds.filter((id) => id !== roleId);
      } else {
        newTemplate.roleIds.push(roleId);
      }

      templates.splice(
        templates.findIndex((request) => request.id === requestId),
        1,
        newTemplate,
      );

      return newTemplate;
    }
  },
  toggleTemplateUser: (requestId, userId) => {
    const request = templates.find((request) => request.id === requestId);

    if (request) {
      const newTemplate = clone(request);
      const isEnabled = newTemplate.userIds.includes(userId);

      if (isEnabled) {
        newTemplate.userIds = newTemplate.userIds.filter((id) => id !== userId);
      } else {
        newTemplate.userIds.push(userId);
      }

      templates.splice(
        templates.findIndex((request) => request.id === requestId),
        1,
        newTemplate,
      );

      return newTemplate;
    }
  },
  getSettings: () => {
    return {
      autoCaptureRequests: true,
      autoRunAnalysis: false,
    };
  },
  updateSettings: (newSettings) => {
    return newSettings;
  },
  runAnalysis: async () => {
    // Sleep 5000
    await new Promise((resolve) => setTimeout(resolve, 5000));
  },
  getResults: () => {
    return results;
  },
  getRequestResponse: async (id) => {
    return {
      type: "Ok",
      request: {
        id,
        raw: "hello",
      },
      response: {
        id,
        raw: "hello",
      },
    };
  },
};

const app = defineApp({
  backend,
  ui: {
    httpRequestEditor: () => ({
      getElement: () => document.createElement("div"),
    }),
    httpResponseEditor: () => ({
      getElement: () => document.createElement("div"),
    }),
  },
} as unknown as CaidoSDK);

app.mount("#app");
