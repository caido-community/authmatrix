import type { DefineAPI, SDK } from "caido:plugin";
import {
	addTemplate,
	deleteTemplate,
	getTemplates,
	registerTemplateEvents,
	toggleTemplateRole,
	toggleTemplateUser,
} from "./services/templates";
import { addRole, deleteRole, getRoles, updateRole } from "./services/roles";
import { addUser, deleteUser, getUsers, updateUser } from "./services/users";
import {getSettings, updateSettings} from "./services/settings";
import {getRequest, getResults, runAnalysis} from "./services/analysis";

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
	deleteTemplate: typeof deleteTemplate;
	toggleTemplateRole: typeof toggleTemplateRole;
	toggleTemplateUser: typeof toggleTemplateUser;

  // Settings endpoints
  getSettings: typeof getSettings;
  updateSettings: typeof updateSettings;

  // Analysis endpoints
  runAnalysis: typeof runAnalysis;
  getResults: typeof getResults;
  getRequest: typeof getRequest;
}>;

export function init(sdk: SDK<API>) {
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
	sdk.api.register("deleteTemplate", deleteTemplate);
	sdk.api.register("toggleTemplateRole", toggleTemplateRole);
	sdk.api.register("toggleTemplateUser", toggleTemplateUser);

  // Settings endpoints
  sdk.api.register("getSettings", getSettings);
  sdk.api.register("updateSettings", updateSettings);

  // Analysis function
  sdk.api.register("runAnalysis", runAnalysis);
  sdk.api.register("getResults", getResults);
  sdk.api.register("getRequest", getRequest);

	// Events
	registerTemplateEvents(sdk);
}
