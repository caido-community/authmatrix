import { z } from 'zod';

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
  roles: z.array(z.string()),
  attributes: z.array(attributesSchema),
});

export type User = z.infer<typeof userSchema>;
