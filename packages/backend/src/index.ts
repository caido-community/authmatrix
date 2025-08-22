import type { DefineAPI, SDK } from "caido:plugin";

import { hydrateStoresFromDb, initDatabase } from "./db";
import {
  getRequestResponse,
  getResults,
  runAnalysis,
} from "./services/analysis";
import { addRole, deleteRole, getRoles, updateRole } from "./services/roles";
import { getSettings, updateSettings } from "./services/settings";
import {
  addTemplate,
  addTemplateFromContext,
  clearTemplates,
  deleteTemplate,
  getTemplates,
  registerTemplateEvents,
  toggleTemplateRole,
  toggleTemplateUser,
  updateTemplate,
} from "./services/templates";
import { addUser, deleteUser, getUsers, updateUser } from "./services/users";
import { RoleStore } from "./stores/roles";
import { UserStore } from "./stores/users";
import { BackendEvents } from "./types";
import { deleteProjectData, getActiveProject } from "./services/utils";

export type { BackendEvents } from "./types";

export type API = DefineAPI<{
  // Role endpoints
  getRoles: typeof getRoles;
  addRole: typeof addRole;
  updateRole: typeof updateRole;
  deleteRole: typeof deleteRole;

  // User endpoints
  getUsers: typeof getUsers;
  addUser: typeof addUser;
  updateUser: typeof updateUser;
  deleteUser: typeof deleteUser;

  // Template endpoints
  getTemplates: typeof getTemplates;
  addTemplate: typeof addTemplate;
  updateTemplate: typeof updateTemplate;
  deleteTemplate: typeof deleteTemplate;
  clearTemplates: typeof clearTemplates;
  toggleTemplateRole: typeof toggleTemplateRole;
  toggleTemplateUser: typeof toggleTemplateUser;
  addTemplateFromContext: typeof addTemplateFromContext;

  // Settings endpoints
  getSettings: typeof getSettings;
  updateSettings: typeof updateSettings;

  // Analysis endpoints
  runAnalysis: typeof runAnalysis;
  getResults: typeof getResults;
  getRequestResponse: typeof getRequestResponse;

  // Utils endpoints
  getActiveProject: typeof getActiveProject;
  deleteProjectData: typeof deleteProjectData;
}>;

export async function init(sdk: SDK<API, BackendEvents>) {
  await initDatabase(sdk);
  await hydrateStoresFromDb(sdk);

  // Role endpoints
  sdk.api.register("getRoles", getRoles);
  sdk.api.register("addRole", addRole);
  sdk.api.register("updateRole", updateRole);
  sdk.api.register("deleteRole", deleteRole);

  // User endpoints
  sdk.api.register("getUsers", getUsers);
  sdk.api.register("addUser", addUser);
  sdk.api.register("updateUser", updateUser);
  sdk.api.register("deleteUser", deleteUser);

  // Template endpoints
  sdk.api.register("getTemplates", getTemplates);
  sdk.api.register("addTemplate", addTemplate);
  sdk.api.register("updateTemplate", updateTemplate);
  sdk.api.register("deleteTemplate", deleteTemplate);
  sdk.api.register("toggleTemplateRole", toggleTemplateRole);
  sdk.api.register("toggleTemplateUser", toggleTemplateUser);
  sdk.api.register("clearTemplates", clearTemplates);
  sdk.api.register("addTemplateFromContext", addTemplateFromContext);

  // Settings endpoints
  sdk.api.register("getSettings", getSettings);
  sdk.api.register("updateSettings", updateSettings);

  // Analysis function
  sdk.api.register("runAnalysis", runAnalysis);
  sdk.api.register("getResults", getResults);
  sdk.api.register("getRequestResponse", getRequestResponse);

  // Utils endpoints
  sdk.api.register("getActiveProject", getActiveProject);
  sdk.api.register("deleteProjectData", deleteProjectData);

  // Events
  registerTemplateEvents(sdk);

  sdk.events.onProjectChange(async (sdk, project) => {
    const projectId = project?.getId();

    const roleStore = RoleStore.get();
    const userStore = UserStore.get();
    roleStore.clear();
    userStore.clear();

    await hydrateStoresFromDb(sdk);
    sdk.api.send("project:changed", projectId);
  });
}
