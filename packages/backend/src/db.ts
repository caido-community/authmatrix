import type { SDK } from "caido:plugin";
import type { RoleDTO, UserAttributeDTO, UserDTO } from "shared";
import type { Database } from "sqlite";

import { RoleStore } from "./stores/roles";
import { UserStore } from "./stores/users";

let dbInstance: Database | undefined;

export const getDb = async (sdk: SDK): Promise<Database> => {
  if (dbInstance) return dbInstance;
  dbInstance = await sdk.meta.db();
  return dbInstance;
};

export const initDatabase = async (sdk: SDK) => {
  const db = await getDb(sdk);
  await db.exec("PRAGMA foreign_keys = ON;");

  await db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      PRIMARY KEY (user_id, role_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_attributes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      value TEXT NOT NULL,
      kind TEXT NOT NULL CHECK(kind in ('Cookie','Header')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  return db;
};

export const hydrateStoresFromDb = async (sdk: SDK) => {
  const db = await getDb(sdk);

  const roleStore = RoleStore.get();
  const userStore = UserStore.get();

  const rolesStmt = await db.prepare("SELECT id, name, description FROM roles");
  const roleRows: RoleDTO[] = await rolesStmt.all();
  for (const role of roleRows) {
    roleStore.addRole(role);
  }

  const usersStmt = await db.prepare("SELECT id, name FROM users");
  const userRows: { id: string; name: string }[] = await usersStmt.all();
  const userRolesStmt = await db.prepare(
    "SELECT role_id as roleId FROM user_roles WHERE user_id = ?",
  );
  const attrsStmt = await db.prepare(
    "SELECT id, name, value, kind FROM user_attributes WHERE user_id = ?",
  );

  for (const user of userRows) {
    const roleIdRows: { roleId: string }[] = await userRolesStmt.all(user.id);
    const roleIds = roleIdRows.map((r) => r.roleId);

    const attrRows: UserAttributeDTO[] = await attrsStmt.all(user.id);

    const dto: UserDTO = {
      id: user.id,
      name: user.name,
      roleIds,
      attributes: attrRows,
    };
    userStore.addUser(dto);
  }
};
