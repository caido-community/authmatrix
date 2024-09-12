import type { UserDTO } from "shared";

export class UserStore {
  private static _store?: UserStore;

  private users: Map<string, UserDTO>;

  private constructor() {
    this.users = new Map();
  }

  static get(): UserStore {
    if (!UserStore._store) {
      UserStore._store = new UserStore();
    }

    return UserStore._store;
  }

  getUser(id: string) {
    return this.users.get(id);
  }

  getUsers() {
    return [...this.users.values()];
  }

  addUser(user: UserDTO) {
    this.users.set(user.id, user);
  }

  deleteUser(requestId: string) {
    this.users.delete(requestId);
  }

  updateUser(id: string, fields: Omit<UserDTO, "id">) {
    const user = this.users.get(id);
    if (user) {
      Object.assign(user, fields);
      return user;
    }
  }
}
