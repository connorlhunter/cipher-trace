# Trace contracts

This package will hold versioned, cross-client contract fixtures for:

- encrypted revision-envelope format
- recipient device key-envelope format
- canonical trace-event payload encoding
- domain-separated Ed25519 signing input
- event validation and policy-transition fixtures

Do not implement custom cryptography in this package. The first implementation work is to choose reviewed primitives/libraries, define format versions, and publish test vectors with architecture review.
