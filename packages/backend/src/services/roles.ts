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
  const project = await sdk.projects.getCurrent();
  if (!project) throw new Error("No active project");
  const projectId = project.getId();
  await createRole(sdk, projectId, role);

  const store = RoleStore.get();
  store.addRole(role);
  return role;
};

export const deleteRole = async (sdk: SDK, id: string) => {
  const project = await sdk.projects.getCurrent();
  if (!project) throw new Error("No active project");
  const projectId = project.getId();
  await removeRole(sdk, projectId, id);
  const store = RoleStore.get();
  store.deleteRole(id);
};

export const updateRole = async (
  sdk: SDK,
  id: string,
  fields: Omit<RoleDTO, "id">,
) => {
  const project = await sdk.projects.getCurrent();
  if (!project) throw new Error("No active project");
  const projectId = project.getId();
  await updateRoleFields(sdk, projectId, id, fields);

  const store = RoleStore.get();
  return store.updateRole(id, fields);
};
