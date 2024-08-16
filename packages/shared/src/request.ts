import { z } from 'zod';

export const requestSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});
