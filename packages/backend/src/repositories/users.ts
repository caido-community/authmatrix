import type { SDK } from "caido:plugin";
import type { UserDTO } from "shared";

import { getDb } from "../db/client";

export const createUser = async (
  sdk: SDK,
  projectId: string,
  user: UserDTO,
): Promise<void> => {
  const db = await getDb(sdk);
  const userStmt = await db.prepare(
    "INSERT INTO users (id, project_id, name) VALUES (?, ?, ?)",
  );
  await userStmt.run(user.id, projectId, user.name);
};

export const removeUser = async (
  sdk: SDK,
  projectId: string,
  id: string,
): Promise<void> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "DELETE FROM users WHERE id = ? AND project_id = ?",
  );
  await stmt.run(id, projectId);
};

export const updateUser = async (
  sdk: SDK,
  projectId: string,
  user: { id: string } & Omit<UserDTO, "id">,
): Promise<Omit<UserDTO, "id">> => {
  const { id, name, roleIds, attributes } = user;

  const db = await getDb(sdk);

  const u = await db.prepare(
    "UPDATE users SET name = ? WHERE id = ? AND project_id = ?",
  );
  await u.run(name, id, projectId);

  const delRoles = await db.prepare(
    "DELETE FROM user_roles WHERE user_id = ? AND project_id = ?",
  );
  await delRoles.run(id, projectId);

  let persistedRoleIds: string[] = [];
  if (roleIds.length > 0) {
    const selAll = await db.prepare(
      `
        SELECT id FROM roles
        WHERE project_id = ?
        `,
    );
    const rows: { id: string }[] = await selAll.all(projectId);
    const valid = new Set(rows.map((r) => r.id));
    persistedRoleIds = roleIds.filter((rid) => valid.has(rid));
    const insRole = await db.prepare(
      `
        INSERT INTO user_roles (user_id, role_id, project_id)
        VALUES (?, ?, ?)
        `,
    );
    for (const rid of persistedRoleIds) {
      await insRole.run(id, rid, projectId);
    }
  }

  if (attributes.length === 0) {
    const delAttrsAll = await db.prepare(
      "DELETE FROM user_attributes WHERE user_id = ? AND project_id = ?",
    );
    await delAttrsAll.run(id, projectId);
  } else {
    const delAttrsAll = await db.prepare(
      "DELETE FROM user_attributes WHERE user_id = ? AND project_id = ?",
    );
    await delAttrsAll.run(id, projectId);
    const upsert = await db.prepare(
      `
        INSERT INTO user_attributes
          (id, user_id, project_id, name, value, kind)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id, project_id)
        DO UPDATE SET name=excluded.name, value=excluded.value, kind=excluded.kind
        `,
    );
    for (const a of attributes) {
      await upsert.run(a.id, id, projectId, a.name, a.value, a.kind);
    }
  }

  return { name, roleIds: persistedRoleIds, attributes };
};
