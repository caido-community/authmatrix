import type { SDK } from "caido:plugin";
import type { RoleDTO, UserAttributeDTO } from "shared";
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
      id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      PRIMARY KEY (id, project_id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      PRIMARY KEY (id, project_id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      PRIMARY KEY (user_id, role_id, project_id),
      FOREIGN KEY (user_id, project_id) REFERENCES users(id, project_id) ON DELETE CASCADE,
      FOREIGN KEY (role_id, project_id) REFERENCES roles(id, project_id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_attributes (
      id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      value TEXT NOT NULL,
      kind TEXT NOT NULL CHECK(kind in ('Cookie','Header')),
      PRIMARY KEY (id, project_id),
      FOREIGN KEY (user_id, project_id) REFERENCES users(id, project_id) ON DELETE CASCADE
    );
  `);

  return db;
};

export const hydrateStoresFromDb = async (sdk: SDK) => {
  const db = await getDb(sdk);
  const roleStore = RoleStore.get();
  const userStore = UserStore.get();

  const current = await sdk.projects.getCurrent();
  if (!current) return;

  const projectID = current.getId();

  const rolesStmt = await db.prepare(
    "SELECT id, name, description FROM roles WHERE project_id = ?"
  );
  const roleRows: RoleDTO[] = await rolesStmt.all(projectID);
  for (const role of roleRows) {
    roleStore.addRole(role);
  }

  const usersStmt = await db.prepare(
    "SELECT id, name FROM users WHERE project_id = ?"
  );
  const userRows: { id: string; name: string }[] = await usersStmt.all(
    projectID
  );

  const userRolesStmt = await db.prepare(
    "SELECT role_id as roleId FROM user_roles WHERE user_id = ? AND project_id = ?"
  );
  const attrsStmt = await db.prepare(
    "SELECT id, name, value, kind FROM user_attributes WHERE user_id = ? AND project_id = ?"
  );

  for (const user of userRows) {
    const roleIdRows: { roleId: string }[] = await userRolesStmt.all(
      user.id,
      projectID
    );
    const roleIds = roleIdRows.map((r) => r.roleId);

    const attrRows: UserAttributeDTO[] = await attrsStmt.all(
      user.id,
      projectID
    );

    userStore.addUser({
      id: user.id,
      name: user.name,
      roleIds,
      attributes: attrRows,
    });
  }
};
