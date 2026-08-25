import { z } from "zod";

export const opaqueIdentifierSchema = z
  .string()
  .min(16)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/u);

export type OpaqueIdentifier = z.infer<typeof opaqueIdentifierSchema>;
