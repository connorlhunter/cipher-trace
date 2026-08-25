# Phase 5: Signed trace and workflow-policy core

## Outcome

The service accepts an immutable event only when its schema, signature, device status, prior hash, ciphertext confirmation, idempotency state, and policy transition are valid in one conditional append operation.

## Ordered work

- Validate canonical, versioned, device-signed trace-event payloads.
- Store immutable event records and advance exactly one document cursor through DynamoDB transactions.
- Enforce stale-head conflicts, idempotency, event-type/version rejection, and policy-version transition checks.
- Build replaceable derived views for current revision and approval state while preserving the trace as source of truth.
- Support ordered trace retrieval and export for independent verification.

## Exit evidence

- Tests reject forged, malformed, replayed, reordered, stale-head, unknown security-critical, and policy-ineligible events.
- Two appends based on the same predecessor cannot both advance the accepted trace.
- Rebuilding projections from accepted events produces the expected current state.

## Non-negotiable constraints

- No signed history is edited in place; correction, revocation, and completion are new events.
- A server acceptance receipt is operational evidence, not a claim about plaintext intent.
- Projections are cacheable convenience reads, never the authority over event history.
