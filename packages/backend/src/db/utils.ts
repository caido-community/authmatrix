import type { SDK } from "caido:plugin";
import type { RoleRuleDTO, TemplateDTO, UserRuleDTO } from "shared";

export const withProject = async <T>(
  sdk: SDK,
  fn: (projectId: string) => Promise<T>,
): Promise<T> => {
  const project = await sdk.projects.getCurrent();
  if (!project) throw new Error("No active project");
  return fn(project.getId());
};

export const fromDbBool = (v: number): boolean => v === 1;
export const toDbBool = (v: boolean): number => (v ? 1 : 0);

export const toTemplateDTO = (row: {
  id: string;
  requestId: string;
  authSuccessRegex: string;
  host: string;
  port: number;
  path: string;
  isTls: number;
  method: string;
}): TemplateDTO => {
  return {
    id: row.id,
    requestId: row.requestId,
    authSuccessRegex: row.authSuccessRegex,
    rules: [],
    meta: {
      host: row.host,
      port: row.port,
      path: row.path,
      isTls: fromDbBool(row.isTls),
      method: row.method,
    },
  };
};

export const toRuleDTO = (row: {
  templateId: string;
  type: "RoleRule" | "UserRule";
  subjectId: string;
  hasAccess: number;
  status: "Untested" | "Enforced" | "Bypassed" | "Unexpected";
}): RoleRuleDTO | UserRuleDTO => {
  if (row.type === "RoleRule") {
    return {
      type: "RoleRule",
      roleId: row.subjectId,
      hasAccess: fromDbBool(row.hasAccess),
      status: row.status,
    };
  }
  return {
    type: "UserRule",
    userId: row.subjectId,
    hasAccess: fromDbBool(row.hasAccess),
    status: row.status,
  };
};
