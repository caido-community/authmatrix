import type { SDK } from "caido:plugin";
import type { UserDTO } from "shared";

import {
  createUser,
  removeUser,
  replaceUserRoles,
  updateUserName,
  upsertUserAttributes,
} from "../repositories/users";
import { UserStore } from "../stores/users";

export const getUsers = (_sdk: SDK) => {
  const store = UserStore.get();
  return store.getUsers();
};

export const addUser = async (sdk: SDK, name: string) => {
  const id = Date.now().toString(36) + Math.random().toString(36).substring(2);

  const user: UserDTO = {
    id,
    name,
    roleIds: [],
    attributes: [],
  };

  await createUser(sdk, user);

  const store = UserStore.get();
  store.addUser(user);

  return user;
};

export const deleteUser = async (sdk: SDK, id: string) => {
  await removeUser(sdk, id);
  const store = UserStore.get();
  store.deleteUser(id);
};

export const updateUser = async (
  sdk: SDK,
  id: string,
  fields: Omit<UserDTO, "id">,
) => {
  const currentStore = UserStore.get();
  const current = currentStore.getUser(id);
  if (!current) return undefined;

  await updateUserName(sdk, id, fields.name);
  await replaceUserRoles(sdk, id, fields.roleIds);
  const existingAttrIds = (current.attributes ?? []).map((a) => a.id);
  await upsertUserAttributes(sdk, id, fields.attributes, existingAttrIds);

  const store = UserStore.get();
  return store.updateUser(id, fields);
};
