import type { SDK } from "caido:plugin";
import type { RoleDTO } from "shared";

import { getDb } from "../db";

export const getAllRoles = async (
  sdk: SDK,
  projectId: string
): Promise<RoleDTO[]> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "SELECT id, name, description FROM roles WHERE project_id = ? ORDER BY name ASC"
  );
  const rows: RoleDTO[] = await stmt.all(projectId);
  return rows;
};

export const createRole = async (
  sdk: SDK,
  projectId: string,
  role: RoleDTO
): Promise<void> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "INSERT INTO roles (id, project_id, name, description) VALUES (?, ?, ?, ?)"
  );
  await stmt.run(role.id, projectId, role.name, role.description);
};

export const removeRole = async (
  sdk: SDK,
  projectId: string,
  id: string
): Promise<void> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "DELETE FROM roles WHERE id = ? AND project_id = ?"
  );
  await stmt.run(id, projectId);
};

export const updateRoleFields = async (
  sdk: SDK,
  projectId: string,
  id: string,
  fields: Omit<RoleDTO, "id">
): Promise<void> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "UPDATE roles SET name = ?, description = ? WHERE id = ? AND project_id = ?"
  );
  await stmt.run(fields.name, fields.description, id, projectId);
};
