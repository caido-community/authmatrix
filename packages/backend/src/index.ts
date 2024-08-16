import type { DefineAPI, SDK } from "caido:plugin";
import {
	addRequest,
	deleteRequest,
	getRequests,
	registerRequestEvents,
	toggleRequestRole,
	toggleRequestUser,
} from "./requests";
import { addRole, deleteRole, getRoles, updateRole } from "./roles";
import { addUser, deleteUser, getUsers, updateUser } from "./users";

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

	// Request endpoints
	getRequests: typeof getRequests;
	addRequest: typeof addRequest;
	deleteRequest: typeof deleteRequest;
	toggleRequestRole: typeof toggleRequestRole;
	toggleRequestUser: typeof toggleRequestUser;
}>;

export function init(sdk: SDK) {
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

	// Request endpoints
	sdk.api.register("getRequests", getRequests);
	sdk.api.register("addRequest", addRequest);
	sdk.api.register("deleteRequest", deleteRequest);
	sdk.api.register("toggleRequestRole", toggleRequestRole);
	sdk.api.register("toggleRequestUser", toggleRequestUser);

	// Events
	registerRequestEvents(sdk);
}
