import {SDK} from "caido:plugin";
import type { Role } from "shared";

const roles: Role[] = [];

export const getRoles = (sdk: SDK): Role[] => {
  return roles;
}

export const addRole = (_sdk: SDK, name: string) => {
  const id = Date.now().toString(36) + Math.random().toString(36).substring(2);

  const role: Role = {
    id,
    name,
    description: ""
  }

  roles.push(role);

  return role;
}

export const deleteRole = (_sdk: SDK, id: string) => {
  const index = roles.findIndex(role => role.id === id);
  if (index !== -1) {
    roles.splice(index, 1);
  }
}

export const updateRole = (_sdk: SDK, id: string, fields: Omit<Role, "id">) => {
  const role = roles.find(role => role.id === id);
  if (role) {
    Object.assign(role, fields);
    return role;
  }
}
