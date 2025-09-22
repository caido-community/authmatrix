import type { SDK } from "caido:plugin";
import type { SubstitutionDTO } from "shared";

import { getDb } from "../db/client";

export const createSubstitution = async (
  sdk: SDK,
  projectId: string,
  substitution: SubstitutionDTO,
): Promise<void> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare(`
    INSERT INTO substitutions (id, project_id, pattern, replacement)
    VALUES (?, ?, ?, ?)
  `);

  await stmt.run(
    substitution.id,
    projectId,
    substitution.pattern,
    substitution.replacement,
  );
};

export const updateSubstitution = async (
  sdk: SDK,
  projectId: string,
  id: string,
  fields: Omit<SubstitutionDTO, "id">,
): Promise<void> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare(`
    UPDATE substitutions SET pattern = ?, replacement = ?
    WHERE id = ? AND project_id = ?
  `);

  await stmt.run(fields.pattern, fields.replacement, id, projectId);
};

export const removeSubstitution = async (
  sdk: SDK,
  projectId: string,
  id: string,
): Promise<void> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare(`
    DELETE FROM substitutions WHERE id = ? AND project_id = ?
  `);

  await stmt.run(id, projectId);
};

export const clearAllSubstitutions = async (
  sdk: SDK,
  projectId: string,
): Promise<void> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare(`
    DELETE FROM substitutions WHERE project_id = ?
  `);

  await stmt.run(projectId);
};
