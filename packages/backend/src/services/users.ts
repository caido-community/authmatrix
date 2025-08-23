import type { SDK } from "caido:plugin";
import type { UserDTO } from "shared";

import { withProject } from "../db/utils";
import {
  createUser,
  updateUser as dbUpdateUser,
  removeUser,
} from "../repositories/users";
import { UserStore } from "../stores/users";
import { generateID } from "../utils";

export const getUsers = (_sdk: SDK) => {
  const store = UserStore.get();
  return store.getUsers();
};

export const addUser = async (sdk: SDK, name: string) => {
  const id = generateID();

  const user: UserDTO = {
    id,
    name,
    roleIds: [],
    attributes: [],
  };

  await withProject(sdk, async (projectId) => {
    await createUser(sdk, projectId, user);
  });

  const store = UserStore.get();
  store.addUser(user);

  return user;
};

export const deleteUser = async (sdk: SDK, id: string) => {
  await withProject(sdk, async (projectId) => {
    await removeUser(sdk, projectId, id);
  });

  const store = UserStore.get();
  store.deleteUser(id);
};

export const updateUser = async (
  sdk: SDK,
  id: string,
  fields: Omit<UserDTO, "id">,
) => {
  const store = UserStore.get();
  const current = store.getUser(id);
  if (!current) return undefined;

  const persisted = await withProject(sdk, async (projectId) => {
    return dbUpdateUser(sdk, projectId, { id, ...fields });
  });

  return store.updateUser(id, persisted);
};
