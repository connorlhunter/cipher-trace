import { z } from "zod";

import { assertNoPlaintextFields } from "./control-plane.ts";
import { opaqueIdentifierSchema } from "./identifiers.ts";

export const traceEventTypeSchema = z.enum([
  "revision.created",
  "revision.submitted",
  "approval.recorded",
  "approval.rejected",
  "workflow.completed",
  "workflow.cancelled",
]);

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

export type TraceEvent = z.infer<typeof traceEventSchema>;
export type TraceEventType = z.infer<typeof traceEventTypeSchema>;

export function parseTraceEvent(payload: unknown): TraceEvent {
  assertNoPlaintextFields(payload);
  return traceEventSchema.parse(payload);
}
