import { z } from "zod";

export const baseRequestSchema = z.object({
	id: z.string(),
	host: z.string(),
	port: z.number(),
	path: z.string(),
	protocol: z.enum(["http", "https"]),
	method: z.string(),
	roleIds: z.array(z.string()),
	userIds: z.array(z.string()),
});

export type BaseRequest = z.infer<typeof baseRequestSchema>;