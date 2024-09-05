import { z } from "zod";

export const ruleStatusSchema = z.enum(["Untested", "Enforced", "Bypassed", "Unexpected"]);
export type RuleStatus = z.infer<typeof ruleStatusSchema>;

export const templateSchema = z.object({
  id: z.string(),
  authSuccessRegex: z.string(),
  rules: z.array(
    z.object({
      type: z.literal("RoleRule"),
      roleId: z.string(),
      hasAccess: z.boolean(),
      status: ruleStatusSchema,
    }).or(z.object({
      type: z.literal("UserRule"),
      userId: z.string(),
      hasAccess: z.boolean(),
      status: ruleStatusSchema,
    })),
  ),
  requestId: z.string(),
  meta: z.object({
    host: z.string(),
    port: z.number(),
    path: z.string(),
    isTls: z.boolean(),
    method: z.string(),
  }),
});

export type Template = z.infer<typeof templateSchema>;

export const analysisResultSchema = z.object({
  id: z.string(),
  userId: z.string(),
  requestId: z.string(),
  templateId: z.string(),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

export type Role = z.infer<typeof roleSchema>;

export const settingsSchema = z.object({
  autoCaptureRequests: z.boolean(),
  autoRunAnalysis: z.boolean(),
});

export type Settings = z.infer<typeof settingsSchema>;

const attributesSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string(),
  kind: z.enum(["Cookie", "Header"]),
});

export type UserAttribute = z.infer<typeof attributesSchema>;

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  roleIds: z.array(z.string()),
  attributes: z.array(attributesSchema),
});

export type User = z.infer<typeof userSchema>;
