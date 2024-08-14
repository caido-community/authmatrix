import { SDK, DefineAPI } from "caido:plugin";
import { getRoles, addRole, updateRole, deleteRole } from "./roles";
import { getUsers, addUser, updateUser, deleteUser } from "./users";

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
}
