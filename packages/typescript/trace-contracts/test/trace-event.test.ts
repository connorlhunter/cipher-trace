import { expect, test } from "bun:test";

import {
  findProhibitedFieldPaths,
  parseTraceEvent,
  type TraceEvent,
} from "../src/index.ts";

function validTraceEvent(): TraceEvent {
  return {
    schema_version: "1",
    event_id: "event_000000000001",
    document_id: "document_000000001",
    revision_id: "revision_000000001",
    event_type: "approval.recorded",
    actor_key_id: "devicekey_00000001",
    policy_id: "policy_0000000001",
    policy_version: 1,
    previous_event_digest: "digest_0000000001",
    event_digest: "digest_0000000002",
    signature: "signature_00000001",
    encrypted_metadata_envelope: "envelope_000000001",
  };
}

test("parses an opaque trace event", (): void => {
  const parsed = parseTraceEvent(validTraceEvent());

  expect(parsed.event_type).toBe("approval.recorded");
  expect(parsed.document_id).toBe("document_000000001");
});

test("rejects plaintext field names before parsing", (): void => {
  expect((): TraceEvent =>
    parseTraceEvent({ ...validTraceEvent(), plaintext: "not allowed" }),
  ).toThrow("plaintext");
});

test("finds prohibited nested field names", (): void => {
  expect(
    findProhibitedFieldPaths({
      encrypted_metadata_envelope: {
        nested: {
          "document-key": "not allowed",
        },
      },
    }),
  ).toEqual(["encrypted_metadata_envelope.nested.document-key"]);
});
