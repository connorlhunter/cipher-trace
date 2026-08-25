# Cipher Trace Roadmap

Cipher Trace will be delivered as an encrypted document provenance and approval platform, not as a generic document-management system. The order below is intentional: no product workflow is allowed to outrun its cryptographic contract, client trust boundary, or verification evidence.

Published architecture and diagrams:

<https://connorhunter.me/projects?project=cipher-trace#cipher-trace>

## Operating rules

- The GitHub Project is the ordered implementation record. Each phase has a parent issue and focused child issues.
- Issue, branch, and pull-request titles use the repository naming rule: feat, fix, chore, docs, test, or refactor followed by an imperative summary.
- A change to an encryption boundary, plaintext-handling rule, signature format, trace semantics, approval rule, data model, deployment shape, or support claim begins with an architecture decision issue.
- No issue may introduce plaintext document bytes, titles, comments, document keys, or deterministic plaintext commitments into API requests, Lambda logs, DynamoDB indexes, S3 keys/tags/metadata, analytics, or error reporting.
- Each phase ends with automated evidence. “Implemented” is not an exit condition by itself.

## Phase 0: Scope, claims, and threat model

Establish the vocabulary and limits before runtime code. Define the protected assets, attacker capabilities, visible server metadata, and the exact distinction between a verified ciphertext-history claim and a plaintext-understanding claim.

Exit gate: reviewed threat model, privacy/claim matrix, capability scope, and architecture decisions explicitly reject server-side plaintext access, document-key escrow, and blockchain dependency.

## Phase 1: Repository foundation and versioned contracts

Create the Python/FastAPI workspace, client boundary, CI, governance files, API contract conventions, and versioned trace/ciphertext schemas. Pin toolchains and establish tests that reject unsafe request shapes before feature work begins.

Exit gate: clean bootstrap and CI; contract fixtures parse deterministically; unsafe plaintext fields are rejected by boundary tests.

## Phase 2: Client cryptographic foundation

Implement and independently test the client-side cryptographic format: AES-256-GCM revision encryption, opaque authenticated additional data, recipient key envelopes, Ed25519 device signatures, canonical trace payload serialization, and versioned test vectors.

Exit gate: deterministic cross-client test vectors, nonce/replay/error-path tests, and no server component receives a document decryption key or plaintext commitment.

## Phase 3: Identity, device enrollment, and key lifecycle

Separate Cognito account identity from client-generated device signing/encryption key pairs. Establish enrollment, key rotation, historical key verification, revocation, and explicit recovery limitations without silently recreating access after a password reset.

Exit gate: authenticated device registration and revocation are auditable; a key's accepted-time status is verifiable; account recovery does not imply document-key recovery.

## Phase 4: Encrypted revision data plane

Build opaque document creation, policy creation, presigned direct-to-S3 ciphertext transfer, upload intents, ciphertext checksum confirmation, encrypted recipient envelopes, and authorized ciphertext download. API Gateway and Lambda remain outside the document-byte path.

Exit gate: end-to-end fixture proves direct ciphertext transfer, checksum confirmation, authorization, idempotency, and explicit rejection of plaintext uploads at every server boundary.

## Phase 5: Signed trace and workflow-policy core

Implement immutable, hash-linked trace events with canonical validation, Ed25519 verification, stale-head conflict handling, conditional DynamoDB append transactions, policy-version checks, and derived read models that never become the authority over history.

Exit gate: adversarial tests prove reordered, replayed, forged, stale, malformed, and unknown security-critical events cannot alter the accepted trace.

## Phase 6: Revision-bound approval workflows and client experience

Deliver the client-only decrypted document review experience, review requests, approvals, change requests, revocations, separation-of-duties policy, threshold evaluation, and trace export/verification. A later revision must never inherit approval satisfaction from an earlier revision.

Exit gate: usability and protocol tests show a reviewer sees the exact locally decrypted revision and signed target before approval; policy tests prove revision binding and distinct-account rules.

## Phase 7: Production AWS boundaries and private operations

Provision the API Gateway/FastAPI Lambda, worker Lambdas, Cognito, private S3, DynamoDB, IAM roles, KMS defense-in-depth, deployment pipeline, structured redaction, metrics, alerts, backups, and recovery runbooks. Operational tooling must preserve the no-plaintext contract.

Exit gate: synthesized infrastructure and live integration checks prove least privilege, private object access, redacted logs, idempotent worker behavior, and a repeatable rollback/recovery procedure.

## Phase 8: Assurance and private-alpha readiness

Perform protocol compatibility testing, fault/concurrency testing, accessibility testing, dependency/security review, incident exercises, claim review, and private-alpha acceptance/rollback criteria. An external cryptographic/security review is required before making a broad public security claim.

Exit gate: signed release candidate, documented limitations, evidence bundle, private-alpha enrollment controls, and a tested rollback decision.

## Deliberately deferred

- Server-side document decryption, indexing, OCR, previews, malware scanning, or content moderation of plaintext
- Document-key escrow, silent password-reset recovery, or server-created replacement keys
- Plaintext search, deterministic plaintext hashes, cross-tenant document deduplication, or semantic document comparison
- Blockchain, wallet authentication, testnet anchoring, or a claim that a trace proves an approver understood a document
- Multi-region recovery until document-key recovery and cryptographic migration policy are explicitly designed

The detailed phase issue source lives in [docs/roadmap](docs/roadmap/).
