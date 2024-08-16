import type { SDK } from "caido:plugin";
import type { User } from "shared";

const users: User[] = [];

export const getUsers = (sdk: SDK) => {
	return users;
};

export const addUser = (sdk: SDK, name: string) => {
	const id = Date.now().toString(36) + Math.random().toString(36).substring(2);

	const user: User = {
		id,
		name,
		roles: [],
		attributes: [],
	};

	users.push(user);

	return user;
};

export const deleteUser = (sdk: SDK, id: string) => {
	const index = users.findIndex((user) => user.id === id);
	if (index !== -1) {
		users.splice(index, 1);
	}
};

export const updateUser = (sdk: SDK, id: string, fields: Omit<User, "id">) => {
	const user = users.find((user) => user.id === id);
	if (user) {
		Object.assign(user, fields);
		return user;
	}
};
