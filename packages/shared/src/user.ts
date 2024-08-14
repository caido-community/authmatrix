import { z } from 'zod';
import { roleSchema } from './role';

const cookieSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string(),
});

export type Cookie = z.infer<typeof cookieSchema>;

const headerSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string(),
});

export type Header = z.infer<typeof headerSchema>;

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  roles: z.array(roleSchema),
  cookies: z.array(cookieSchema),
  headers: z.array(headerSchema),
});

export type User = z.infer<typeof userSchema>;
