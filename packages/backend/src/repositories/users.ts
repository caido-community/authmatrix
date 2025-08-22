import type { SDK } from "caido:plugin";
import type { UserAttributeDTO, UserDTO } from "shared";

import { getDb } from "../db";

export const createUser = async (sdk: SDK, user: UserDTO): Promise<void> => {
  const db = await getDb(sdk);
  const userStmt = await db.prepare(
    "INSERT INTO users (id, name) VALUES (?, ?)",
  );
  await userStmt.run(user.id, user.name);
};

export const removeUser = async (sdk: SDK, id: string): Promise<void> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare("DELETE FROM users WHERE id = ?");
  await stmt.run(id);
};

export const updateUserName = async (
  sdk: SDK,
  id: string,
  name: string,
): Promise<void> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare("UPDATE users SET name = ? WHERE id = ?");
  await stmt.run(name, id);
};

export const replaceUserRoles = async (
  sdk: SDK,
  id: string,
  roleIds: string[],
): Promise<void> => {
  const db = await getDb(sdk);
  const del = await db.prepare("DELETE FROM user_roles WHERE user_id = ?");
  await del.run(id);
  if (roleIds.length === 0) return;
  const ins = await db.prepare(
    "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
  );
  for (const roleId of roleIds) {
    await ins.run(id, roleId);
  }
};

export const upsertUserAttributes = async (
  sdk: SDK,
  id: string,
  attributes: UserAttributeDTO[],
  existingIds: string[],
): Promise<void> => {
  const db = await getDb(sdk);

  const newIds = new Set(attributes.map((a) => a.id));
  for (const oldId of existingIds) {
    if (!newIds.has(oldId)) {
      const del = await db.prepare("DELETE FROM user_attributes WHERE id = ?");
      await del.run(oldId);
    }
  }

  const upsert = await db.prepare(`
    INSERT INTO user_attributes (id, user_id, name, value, kind)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      value = excluded.value,
      kind = excluded.kind
  `);

  for (const attr of attributes) {
    await upsert.run(attr.id, id, attr.name, attr.value, attr.kind);
  }
};
