# Phase 0: Scope, claims, and threat model

## Outcome

Cipher Trace has one reviewed statement of what it protects, what it verifies, and what it cannot know. Every later contract and test derives from this statement.

## Ordered work

- Define the private-alpha capability boundary and explicitly defer plaintext features.
- Document assets, adversaries, client/server trust boundaries, and visible operational metadata.
- Publish a privacy and verification claim matrix that distinguishes ciphertext-history verification from plaintext interpretation.
- Record ADRs for the client encryption boundary, no-key-escrow policy, signed trace, revision-bound approvals, and no-blockchain product scope.

## Exit evidence

- A reviewer can identify exactly where plaintext exists and verify that no server component is in that path.
- The published limitations say that the service cannot read, understand, compare, or recover documents.
- The product does not make a production security claim before independent review.

## Non-negotiable constraints

- Server-side encryption at rest is defense in depth, not end-to-end encryption.
- Cognito password recovery does not imply document-key recovery.
- An approval proves a permitted key signed a particular ciphertext revision and policy context; it does not prove human comprehension.
