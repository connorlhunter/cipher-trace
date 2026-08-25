# Phase 7: Production AWS boundaries and private operations

## Outcome

The deployed control plane and workers operate with least privilege and usable operational evidence while preserving the no-plaintext boundary.

## Ordered work

- Define infrastructure as code for API Gateway, FastAPI/Mangum Lambda, worker Lambdas, Cognito, private S3, DynamoDB, IAM, and KMS defense in depth.
- Deploy separate least-privilege roles for API, ciphertext confirmation, and trace projection.
- Enforce private S3, short-lived presigned access, transport encryption, generated object names, and checksum-oriented object policies.
- Implement structured logging redaction, operational metrics, alerts, audit records, backups, and recovery runbooks.
- Add guarded deployment, rollback, and live integration validation.

## Exit evidence

- Synthesized infrastructure and live checks prove role separation, private objects, and absence of a document-decryption permission.
- Logs and alerts are tested against sensitive request headers, opaque envelopes, and accidental plaintext fixtures.
- A reviewed operator can deploy, pause, recover, and roll back without console-only steps.

## Non-negotiable constraints

- KMS/S3 encryption at rest does not authorize document decryption.
- No worker may use local memory or an in-process FastAPI task as durable workflow state.
- Observability must minimize even opaque customer metadata and must not capture plaintext.
