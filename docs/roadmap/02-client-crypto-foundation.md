# Phase 2: Client cryptographic foundation

## Outcome

Trusted clients can create and validate versioned encrypted revisions, device key envelopes, and signed trace payloads without involving a service-held document key.

## Ordered work

- Choose reviewed client libraries and record cryptographic library/version decisions before implementation.
- Define AES-256-GCM encrypted revision and private-descriptor formats with fresh nonce requirements and opaque authenticated additional data.
- Define recipient-specific envelopes for client-generated document data-encryption keys using device encryption public keys.
- Define canonical trace-event serialization, domain separation, Ed25519 signing input, and key identifiers.
- Publish cross-client vectors for valid and invalid encryption, envelope, signature, canonicalization, replay, and format-migration cases.

## Exit evidence

- Independent client implementations derive identical ciphertext/trace validation results from approved fixtures.
- Tests demonstrate nonce uniqueness requirements, authenticated additional-data failures, rejected malformed envelopes, and rejected signature changes.
- No service-visible record contains a plaintext document key or an unsalted deterministic plaintext digest.

## Non-negotiable constraints

- Do not create custom cryptographic primitives.
- Do not reuse an AEAD nonce under a document key.
- Do not use a ciphertext checksum as a cross-tenant deduplication key.
