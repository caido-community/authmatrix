import type { SDK } from "caido:plugin";
import type { User } from "shared";
import {UserStore} from "../stores/users";


export const getUsers = (sdk: SDK) => {
  const store = UserStore.get();
  return store.getUsers();
};

export const addUser = (sdk: SDK, name: string) => {
	const id = Date.now().toString(36) + Math.random().toString(36).substring(2);

	const user: User = {
		id,
		name,
		roleIds: [],
		attributes: [],
	};

  const store = UserStore.get();
  store.addUser(user);

	return user;
};

export const deleteUser = (sdk: SDK, id: string) => {
  const store = UserStore.get();
  store.deleteUser(id);
};

export const updateUser = (sdk: SDK, id: string, fields: Omit<User, "id">) => {
  const store = UserStore.get();
  return store.updateUser(id, fields);
};
