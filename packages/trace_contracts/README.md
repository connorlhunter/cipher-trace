# Trace contracts

The executable contract scaffolds currently live in:

- packages/python/cipher-trace-core
- packages/typescript/trace-contracts

They hold strict field-shape validation only. The published Cipher Trace architecture remains the source for approved protocol semantics.

Future versioned, cross-client fixtures will cover:

- encrypted revision-envelope format
- recipient device key-envelope format
- canonical trace-event payload encoding
- domain-separated Ed25519 signing input
- event validation and policy-transition fixtures

Do not implement custom cryptography in this package. The first implementation work is to choose reviewed primitives/libraries, define format versions, and publish test vectors with architecture review.
