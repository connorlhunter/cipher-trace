import { z } from "zod";

import { assertNoPlaintextFields } from "./control-plane.ts";
import { opaqueIdentifierSchema } from "./identifiers.ts";

/** Enumerates the workflow changes that can appear in a trace event. */
export const traceEventTypeSchema = z.enum([
  "revision.created",
  "revision.submitted",
  "approval.recorded",
  "approval.rejected",
  "workflow.completed",
  "workflow.cancelled",
]);

/**
 * Validates the server-visible envelope for one immutable trace event.
 *
 * The schema contains identifiers, digests, signatures, and optional encrypted
 * metadata only. It does not accept document content or document keys.
 */
export const traceEventSchema = z
  .object({
    schema_version: z.literal("1"),
    event_id: opaqueIdentifierSchema,
    document_id: opaqueIdentifierSchema,
    revision_id: opaqueIdentifierSchema,
    event_type: traceEventTypeSchema,
    actor_key_id: opaqueIdentifierSchema,
    policy_id: opaqueIdentifierSchema,
    policy_version: z.number().int().min(1),
    previous_event_digest: z.string().min(16).max(256).nullable().optional(),
    event_digest: z.string().min(16).max(256),
    signature: z.string().min(16).max(16384),
    encrypted_metadata_envelope: z
      .string()
      .min(1)
      .max(65536)
      .nullable()
      .optional(),
  })
  .strict();

/** A validated immutable trace event. */
export type TraceEvent = z.infer<typeof traceEventSchema>;
/** A valid trace event name. */
export type TraceEventType = z.infer<typeof traceEventTypeSchema>;

/**
 * Validate a trace event and reject plaintext-style field names.
 *
 * @param payload Untrusted value received at a contract boundary.
 * @returns The validated immutable trace event.
 * @throws {Error} When field names or event values do not match the contract.
 */
export function parseTraceEvent(payload: unknown): TraceEvent {
  assertNoPlaintextFields(payload);
  return traceEventSchema.parse(payload);
}
