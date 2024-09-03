import type { User } from "shared";

export class UserStore {
  private static _store?: UserStore;

  private users: Map<string, User>;

  private constructor() {
    this.users = new Map();
  }

  static get(): UserStore {
    if (!UserStore._store) {
      UserStore._store = new UserStore();
    }

    return UserStore._store;
  }

  getUsers() {
    return [...this.users.values()];
  }

  addUser(role: User) {
    this.users.set(role.id, role);
  }

  deleteUser(requestId: string) {
    this.users.delete(requestId);
  }

  updateUser(id: string, fields: Omit<User, "id">) {
    const role = this.users.get(id);
    if (role) {
      Object.assign(role, fields);
      return role;
    }
  }
}
