import {Role} from "shared";

export class RoleStore {
  private static _store?: RoleStore;

  private roles: Map<string, Role>;

  private constructor() {
    this.roles = new Map();
  }

  static get(): RoleStore {
    if (!RoleStore._store) {
      RoleStore._store = new RoleStore();
    }

    return RoleStore._store;
  }

  getRoles() {
    return [...this.roles.values()];
  }

  addRole(role: Role) {
    this.roles.set(role.id, role);
  }

  deleteRole(requestId: string) {
    this.roles.delete(requestId);
  }

  updateRole(id: string, fields: Omit<Role, "id">) {
    const role = this.roles.get(id);
    if (role) {
      Object.assign(role, fields);
      return role;
    }
  }
}

