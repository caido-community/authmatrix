import { SDK, DefineAPI } from "caido:plugin";
import { getRoles, addRole, updateRole, deleteRole } from "./roles";

export type API = DefineAPI<{
  getRoles: typeof getRoles;
  addRole: typeof addRole;
  updateRole: typeof updateRole;
  deleteRole: typeof deleteRole;
}>;

export function init(sdk: SDK) {
  sdk.api.register("getRoles", getRoles);
  sdk.api.register("addRole", addRole);
  sdk.api.register("updateRole", updateRole);
  sdk.api.register("deleteRole", deleteRole);
}
