# Phase 4: Encrypted revision data plane

## Outcome

Authorized clients upload and retrieve immutable ciphertext revisions directly with private S3, while the control plane verifies object facts and authorization without handling document bytes.

## Ordered work

- Create opaque document and workflow-policy records with no plaintext titles or search fields.
- Create short-lived, authorized presigned upload intents that bind an opaque object location and declared ciphertext facts.
- Upload ciphertext directly from the client to private S3 and confirm complete object checksum/idempotent object facts in a dedicated Python Lambda.
- Record encrypted recipient key envelopes through signed access events.
- Issue authorized ciphertext download intents and return opaque revision/trace metadata.

## Exit evidence

- An end-to-end fixture proves that API Gateway and Lambda do not receive document bytes.
- The confirmer accepts only expected ciphertext object facts and handles duplicated S3 notifications safely.
- Unauthorized accounts/devices cannot obtain upload, download, or key-envelope access.

## Non-negotiable constraints

- S3 object keys, tags, and metadata cannot contain plaintext names, titles, comments, or document keys.
- The service verifies a complete ciphertext SHA-256 value; it does not derive a plaintext hash.
- Direct transfer is required for documents; the API is not a file proxy.
