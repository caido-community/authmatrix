import type { SDK } from "caido:plugin";
import type { RoleDTO } from "shared";

import { getDb } from "../db";

export const getAllRoles = async (sdk: SDK): Promise<RoleDTO[]> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "SELECT id, name, description FROM roles ORDER BY name ASC",
  );
  const rows: RoleDTO[] = await stmt.all();
  return rows;
};

export const createRole = async (sdk: SDK, role: RoleDTO): Promise<void> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "INSERT INTO roles (id, name, description) VALUES (?, ?, ?)",
  );
  await stmt.run(role.id, role.name, role.description);
};

export const removeRole = async (sdk: SDK, id: string): Promise<void> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare("DELETE FROM roles WHERE id = ?");
  await stmt.run(id);
};

export const updateRoleFields = async (
  sdk: SDK,
  id: string,
  fields: Omit<RoleDTO, "id">,
): Promise<void> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "UPDATE roles SET name = ?, description = ? WHERE id = ?",
  );
  await stmt.run(fields.name, fields.description, id);
};
