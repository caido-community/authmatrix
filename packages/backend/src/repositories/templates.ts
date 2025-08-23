import type { SDK } from "caido:plugin";
import type { RoleRuleDTO, TemplateDTO, UserRuleDTO } from "shared";

import { getDb } from "../db/client";
import { toDbBool } from "../db/utils";

export const createTemplate = async (
  sdk: SDK,
  projectId: string,
  template: TemplateDTO,
): Promise<void> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare(`
    INSERT INTO templates (
      id, project_id, request_id, auth_success_regex,
      meta_host, meta_port, meta_path, meta_is_tls, meta_method
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  await stmt.run(
    template.id,
    projectId,
    template.requestId,
    template.authSuccessRegex,
    template.meta.host,
    template.meta.port,
    template.meta.path,
    toDbBool(template.meta.isTls),
    template.meta.method,
  );
};

export const updateTemplateFields = async (
  sdk: SDK,
  projectId: string,
  id: string,
  fields: Omit<TemplateDTO, "id">,
): Promise<void> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare(`
    UPDATE templates SET
      request_id = ?,
      auth_success_regex = ?,
      meta_host = ?,
      meta_port = ?,
      meta_path = ?,
      meta_is_tls = ?,
      meta_method = ?
    WHERE id = ? AND project_id = ?
  `);
  await stmt.run(
    fields.requestId,
    fields.authSuccessRegex,
    fields.meta.host,
    fields.meta.port,
    fields.meta.path,
    toDbBool(fields.meta.isTls),
    fields.meta.method,
    id,
    projectId,
  );
};

export const removeTemplate = async (
  sdk: SDK,
  projectId: string,
  id: string,
): Promise<void> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare(`
    DELETE FROM templates WHERE id = ? AND project_id = ?
  `);
  await stmt.run(id, projectId);
};

export const clearAllTemplates = async (
  sdk: SDK,
  projectId: string,
): Promise<void> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare(`
    DELETE FROM templates WHERE project_id = ?
  `);
  await stmt.run(projectId);
};

export const upsertTemplateRule = async (
  sdk: SDK,
  projectId: string,
  templateId: string,
  rule: RoleRuleDTO | UserRuleDTO,
): Promise<void> => {
  const db = await getDb(sdk);
  const stmt = await db.prepare(`
    INSERT INTO template_rules (
      template_id, project_id, subject_type, subject_id, has_access, status
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(template_id, project_id, subject_type, subject_id)
    DO UPDATE SET has_access = excluded.has_access, status = excluded.status
  `);
  const type = rule.type;
  const subjectId = type === "RoleRule" ? rule.roleId : rule.userId;
  await stmt.run(
    templateId,
    projectId,
    type,
    subjectId,
    toDbBool(rule.hasAccess),
    rule.status,
  );
};

export const replaceTemplateRules = async (
  sdk: SDK,
  projectId: string,
  templateId: string,
  rules: Array<RoleRuleDTO | UserRuleDTO>,
): Promise<void> => {
  const db = await getDb(sdk);
  const del = await db.prepare(`
      DELETE FROM template_rules WHERE template_id = ? AND project_id = ?
    `);
  await del.run(templateId, projectId);
  if (rules.length === 0) return;
  const ins = await db.prepare(`
      INSERT INTO template_rules (
        template_id, project_id, subject_type, subject_id, has_access, status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
  for (const rule of rules) {
    const type = rule.type;
    const subjectId = type === "RoleRule" ? rule.roleId : rule.userId;
    await ins.run(
      templateId,
      projectId,
      type,
      subjectId,
      toDbBool(rule.hasAccess),
      rule.status,
    );
  }
};
