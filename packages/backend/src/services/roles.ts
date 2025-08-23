import type { SDK } from "caido:plugin";
import type { RoleDTO } from "shared";

import { withProject } from "../db/utils";
import {
  createRole,
  removeRole,
  updateRoleFields,
} from "../repositories/roles";
import { RoleStore } from "../stores/roles";
import { UserStore } from "../stores/users";
import { generateID } from "../utils";

export const getRoles = (sdk: SDK): RoleDTO[] => {
  const store = RoleStore.get();
  return store.getRoles();
};

export const addRole = async (sdk: SDK, name: string) => {
  const id = generateID();
  const role: RoleDTO = { id, name, description: "" };
  await withProject(sdk, async (projectId) => {
    await createRole(sdk, projectId, role);
  });

  const store = RoleStore.get();
  store.addRole(role);
  return role;
};

export const deleteRole = async (sdk: SDK, id: string) => {
  await withProject(sdk, async (projectId) => {
    await removeRole(sdk, projectId, id);
  });

  const store = RoleStore.get();
  store.deleteRole(id);

  const userStore = UserStore.get();
  userStore.removeRoleFromAllUsers(id);
};

export const updateRole = async (
  sdk: SDK,
  id: string,
  fields: Omit<RoleDTO, "id">,
) => {
  await withProject(sdk, async (projectId) => {
    await updateRoleFields(sdk, projectId, id, fields);
  });

  const store = RoleStore.get();
  return store.updateRole(id, fields);
};
