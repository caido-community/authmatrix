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
  addSubstitution,
  clearSubstitutions,
  deleteSubstitution,
  getSubstitutions,
  updateSubstitutionFields,
} from "./services/substitutions";
import {
  addTemplate,
  addTemplateFromContext,
  checkAllTemplatesForRole,
  checkAllTemplatesForUser,
  clearTemplates,
  deleteTemplate,
  getTemplates,
  importTemplatesFromOpenApi,
  registerTemplateEvents,
  toggleTemplateRole,
  toggleTemplateUser,
  updateTemplate,
  updateTemplateRequest,
  updateTemplateRequestRaw,
} from "./services/templates";
import { addUser, deleteUser, getUsers, updateUser } from "./services/users";
import { deleteProjectData, getActiveProject } from "./services/utils";
import { RoleStore } from "./stores/roles";
import { SubstitutionStore } from "./stores/substitutions";
import { TemplateStore } from "./stores/templates";
import { UserStore } from "./stores/users";
import { type BackendEvents } from "./types";

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
  updateTemplateRequest: typeof updateTemplateRequest;
  updateTemplateRequestRaw: typeof updateTemplateRequestRaw;
  deleteTemplate: typeof deleteTemplate;
  clearTemplates: typeof clearTemplates;
  toggleTemplateRole: typeof toggleTemplateRole;
  toggleTemplateUser: typeof toggleTemplateUser;
  checkAllTemplatesForRole: typeof checkAllTemplatesForRole;
  checkAllTemplatesForUser: typeof checkAllTemplatesForUser;
  addTemplateFromContext: typeof addTemplateFromContext;
  importTemplatesFromOpenApi: typeof importTemplatesFromOpenApi;

  // Settings endpoints
  getSettings: typeof getSettings;
  updateSettings: typeof updateSettings;

  // Analysis endpoints
  runAnalysis: typeof runAnalysis;
  getResults: typeof getResults;
  getRequestResponse: typeof getRequestResponse;

  // Substitution endpoints
  getSubstitutions: typeof getSubstitutions;
  addSubstitution: typeof addSubstitution;
  updateSubstitutionFields: typeof updateSubstitutionFields;
  deleteSubstitution: typeof deleteSubstitution;
  clearSubstitutions: typeof clearSubstitutions;

  // Utils endpoints
  getActiveProject: typeof getActiveProject;
  deleteProjectData: typeof deleteProjectData;
}>;

export async function init(sdk: SDK<API, BackendEvents>) {
  // DB setup
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
  sdk.api.register("updateTemplateRequest", updateTemplateRequest);
  sdk.api.register("updateTemplateRequestRaw", updateTemplateRequestRaw);
  sdk.api.register("deleteTemplate", deleteTemplate);
  sdk.api.register("toggleTemplateRole", toggleTemplateRole);
  sdk.api.register("toggleTemplateUser", toggleTemplateUser);
  sdk.api.register("checkAllTemplatesForRole", checkAllTemplatesForRole);
  sdk.api.register("checkAllTemplatesForUser", checkAllTemplatesForUser);
  sdk.api.register("clearTemplates", clearTemplates);
  sdk.api.register("addTemplateFromContext", addTemplateFromContext);
  sdk.api.register("importTemplatesFromOpenApi", importTemplatesFromOpenApi);

  // Settings endpoints
  sdk.api.register("getSettings", getSettings);
  sdk.api.register("updateSettings", updateSettings);

  // Analysis function
  sdk.api.register("runAnalysis", runAnalysis);
  sdk.api.register("getResults", getResults);
  sdk.api.register("getRequestResponse", getRequestResponse);

  // Substitution endpoints
  sdk.api.register("getSubstitutions", getSubstitutions);
  sdk.api.register("addSubstitution", addSubstitution);
  sdk.api.register("updateSubstitutionFields", updateSubstitutionFields);
  sdk.api.register("deleteSubstitution", deleteSubstitution);
  sdk.api.register("clearSubstitutions", clearSubstitutions);

  // Utils endpoints
  sdk.api.register("getActiveProject", getActiveProject);
  sdk.api.register("deleteProjectData", deleteProjectData);

  // Events
  registerTemplateEvents(sdk);

  // On project change we want to clear all stores and re-hydrate from the database with new projectID
  sdk.events.onProjectChange(async (sdk, project) => {
    const roleStore = RoleStore.get();
    const templateStore = TemplateStore.get();
    const userStore = UserStore.get();
    const substitutionStore = SubstitutionStore.get();

    roleStore.clear();
    templateStore.clearTemplates();
    userStore.clear();
    substitutionStore.clear();

    await hydrateStoresFromDb(sdk);

    const projectId = project?.getId();
    sdk.api.send("project:changed", projectId);
  });
}
