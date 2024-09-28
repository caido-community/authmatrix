import { EditorView } from "@codemirror/view";
import type { API } from "backend";
import type { AnalysisRequestDTO, TemplateDTO, UserDTO } from "shared";
import { defineApp } from "./app";
import type { CaidoSDK } from "./types";
import { clone } from "./utils";

// This is a mock backend for the SDK
// This is only for development purposes
const templates: TemplateDTO[] = [
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
    rules: [
      {
        type: "UserRule",
        userId: "1",
        hasAccess: true,
        status: "Unexpected",
      },
    ],
  },
  {
    id: "2",
    requestId: "1",
    authSuccessRegex: "HTTP/1[.]1 200",
    meta: {
      method: "GET",
      host: "localhost",
      path: "/",
      port: 80,
      isTls: false,
    },
    rules: [
      {
        type: "UserRule",
        userId: "1",
        hasAccess: true,
        status: "Bypassed",
      },
    ],
  },
  {
    id: "3",
    requestId: "1",
    authSuccessRegex: "HTTP/1[.]1 200",
    meta: {
      method: "GET",
      host: "localhost",
      path: "/",
      port: 80,
      isTls: false,
    },
    rules: [
      {
        type: "UserRule",
        userId: "1",
        hasAccess: true,
        status: "Enforced",
      },
    ],
  },
];

const results: AnalysisRequestDTO[] = [
  {
    id: "1",
    userId: "1",
    requestId: "1",
    templateId: "1",
  },
];

const users: UserDTO[] = [
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
  clearTemplates: () => {
    templates.length = 0;
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
      rules: [],
    };

    templates.push(newTemplate);

    return newTemplate;
  },
  updateTemplate: (id, fields) => {
    const template = templates.find((template) => template.id === id);

    if (template) {
      const newTemplate = clone({
        ...template,
        ...fields,
      });

      templates.splice(
        templates.findIndex((template) => template.id === id),
        1,
        newTemplate,
      );

      return newTemplate;
    }
  },
  deleteTemplate: (id) => {
    const index = templates.findIndex((request) => request.id === id);
    if (index !== -1) {
      templates.splice(index, 1);
    }
  },
  toggleTemplateRole: (templateId, roleId) => {
    const template = templates.find((template) => template.id === templateId);

    if (template) {
      const newTemplate = clone(template);
      const currRule = newTemplate.rules.find((rule) => {
        return rule.type === "RoleRule" && rule.roleId === roleId;
      });

      if (currRule) {
        currRule.hasAccess = !currRule.hasAccess;
      } else {
        newTemplate.rules.push({
          type: "RoleRule",
          roleId,
          hasAccess: true,
          status: "Untested",
        });
      }

      templates.splice(
        templates.findIndex((template) => template.id === templateId),
        1,
        newTemplate,
      );

      return newTemplate;
    }
  },
  toggleTemplateUser: (requestId, userId) => {
    const template = templates.find((template) => template.id === requestId);

    if (template) {
      const newTemplate = clone(template);
      const currRule = newTemplate.rules.find((rule) => {
        return rule.type === "UserRule" && rule.userId === userId;
      });

      if (currRule) {
        currRule.hasAccess = !currRule.hasAccess;
      } else {
        newTemplate.rules.push({
          type: "UserRule",
          userId,
          hasAccess: true,
          status: "Untested",
        });
      }

      templates.splice(
        templates.findIndex((template) => template.id === requestId),
        1,
        newTemplate,
      );

      return newTemplate;
    }
  },
  getSettings: () => {
    return {
      autoCaptureRequests: "off",
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
      getEditorView: () => new EditorView(),
    }),
    httpResponseEditor: () => ({
      getElement: () => document.createElement("div"),
      getEditorView: () => new EditorView(),
    }),
  },
} as unknown as CaidoSDK);

app.mount("#app");
