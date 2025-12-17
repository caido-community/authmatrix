import type { SDK } from "caido:plugin";
import type { RoleDTO, UserAttributeDTO } from "shared";

import { RoleStore } from "../stores/roles";
import { TemplateStore } from "../stores/templates";
import { UserStore } from "../stores/users";

import { getDb } from "./client";
import { toRuleDTO, toTemplateDTO } from "./utils";

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

  await db.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      request_id TEXT NOT NULL,
      auth_success_regex TEXT NOT NULL,
      original_response_length INTEGER NOT NULL DEFAULT 0,
      meta_host TEXT NOT NULL,
      meta_port INTEGER NOT NULL,
      meta_path TEXT NOT NULL,
      meta_is_tls INTEGER NOT NULL CHECK(meta_is_tls in (0,1)),
      meta_method TEXT NOT NULL,
      PRIMARY KEY (id, project_id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS template_rules (
      template_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      subject_type TEXT NOT NULL CHECK(subject_type in ('RoleRule','UserRule')),
      subject_id TEXT NOT NULL,
      has_access INTEGER NOT NULL CHECK(has_access in (0,1)),
      status TEXT NOT NULL CHECK(status in ('Untested','Enforced','Bypassed','Unexpected')),
      PRIMARY KEY (template_id, project_id, subject_type, subject_id),
      FOREIGN KEY (template_id, project_id) REFERENCES templates(id, project_id) ON DELETE CASCADE
    );
  `);

  // Migration: Add original_response_length column if it doesn't exist
  try {
    await db.exec(`
      ALTER TABLE templates ADD COLUMN original_response_length INTEGER NOT NULL DEFAULT 0;
    `);
  } catch {
    // Column already exists, ignore error
  }

  return db;
};

export const hydrateStoresFromDb = async (sdk: SDK) => {
  const db = await getDb(sdk);
  const roleStore = RoleStore.get();
  const templateStore = TemplateStore.get();
  const userStore = UserStore.get();

  const current = await sdk.projects.getCurrent();
  if (!current) return;

  const projectID = current.getId();

  const rolesStmt = await db.prepare(
    "SELECT id, name, description FROM roles WHERE project_id = ?",
  );
  const roleRows: RoleDTO[] = await rolesStmt.all(projectID);
  for (const role of roleRows) {
    roleStore.addRole(role);
  }

  const usersStmt = await db.prepare(
    "SELECT id, name FROM users WHERE project_id = ?",
  );
  const userRows: { id: string; name: string }[] =
    await usersStmt.all(projectID);

  const userRolesStmt = await db.prepare(
    "SELECT role_id as roleId FROM user_roles WHERE user_id = ? AND project_id = ?",
  );
  const attrsStmt = await db.prepare(
    "SELECT id, name, value, kind FROM user_attributes WHERE user_id = ? AND project_id = ?",
  );

  for (const user of userRows) {
    const roleIdRows: { roleId: string }[] = await userRolesStmt.all(
      user.id,
      projectID,
    );
    const roleIds = roleIdRows.map((r) => r.roleId);

    const attrRows: UserAttributeDTO[] = await attrsStmt.all(
      user.id,
      projectID,
    );

    userStore.addUser({
      id: user.id,
      name: user.name,
      roleIds,
      attributes: attrRows,
    });
  }

  const templatesStmt = await db.prepare(`
    SELECT id, request_id as requestId, auth_success_regex as authSuccessRegex,
           original_response_length as originalResponseLength,
           meta_host as host, meta_port as port, meta_path as path,
           meta_is_tls as isTls, meta_method as method
    FROM templates WHERE project_id = ?
  `);
  const ruleRowsStmt = await db.prepare(`
    SELECT template_id as templateId, subject_type as type, subject_id as subjectId,
           has_access as hasAccess, status
    FROM template_rules WHERE project_id = ?
  `);

  const templateRows: Array<{
    id: string;
    requestId: string;
    authSuccessRegex: string;
    originalResponseLength: number;
    host: string;
    port: number;
    path: string;
    isTls: number;
    method: string;
  }> = await templatesStmt.all(projectID);

  const ruleRows: Array<{
    templateId: string;
    type: "RoleRule" | "UserRule";
    subjectId: string;
    hasAccess: number;
    status: "Untested" | "Enforced" | "Bypassed" | "Unexpected";
  }> = await ruleRowsStmt.all(projectID);

  const rulesByTemplate = new Map<string, typeof ruleRows>();
  for (const row of ruleRows) {
    const list = rulesByTemplate.get(row.templateId) ?? [];
    list.push(row);
    rulesByTemplate.set(row.templateId, list);
  }

  for (const t of templateRows) {
    const rules = (rulesByTemplate.get(t.id) ?? []).map(toRuleDTO);
    const dto = toTemplateDTO(t);
    dto.rules = rules;
    templateStore.addTemplate(dto);
  }
};
