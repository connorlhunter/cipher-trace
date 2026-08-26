import { z } from "zod";

/**
 * Validates a stable opaque reference used in a trace event.
 *
 * It intentionally excludes document names and readable metadata.
 */
export const opaqueIdentifierSchema = z
  .string()
  .min(16)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/u);

/** A validated opaque identifier from {@link opaqueIdentifierSchema}. */
export type OpaqueIdentifier = z.infer<typeof opaqueIdentifierSchema>;
