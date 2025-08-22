import type { SDK } from "caido:plugin";
import type { RoleDTO } from "shared";

import {
  createRole,
  removeRole,
  updateRoleFields,
} from "../repositories/roles";
import { RoleStore } from "../stores/roles";

export const getRoles = (sdk: SDK): RoleDTO[] => {
  const store = RoleStore.get();
  return store.getRoles();
};

export const addRole = async (sdk: SDK, name: string) => {
  const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
  const role: RoleDTO = { id, name, description: "" };
  await createRole(sdk, role);

  const store = RoleStore.get();
  store.addRole(role);
  return role;
};

export const deleteRole = async (sdk: SDK, id: string) => {
  await removeRole(sdk, id);
  const store = RoleStore.get();
  store.deleteRole(id);
};

export const updateRole = async (
  sdk: SDK,
  id: string,
  fields: Omit<RoleDTO, "id">,
) => {
  await updateRoleFields(sdk, id, fields);

  const store = RoleStore.get();
  return store.updateRole(id, fields);
};
