import { z } from "zod";

export const settingsSchema = z.object({
  autoCaptureRequests: z.boolean(),
  autoRunAnalysis: z.boolean(),
});

export type Settings = z.infer<typeof settingsSchema>;
