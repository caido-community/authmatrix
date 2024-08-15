import { z } from 'zod';
import { roleSchema } from './role';

const attributesSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string(),
  kind: z.enum(['Cookie', 'Header']),
});

export type UserAttribute = z.infer<typeof attributesSchema>;

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  roles: z.array(roleSchema),
  attributes: z.array(attributesSchema),
});

export type User = z.infer<typeof userSchema>;
