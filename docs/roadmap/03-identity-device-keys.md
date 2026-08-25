# Phase 3: Identity, device enrollment, and key lifecycle

## Outcome

Cognito accounts and client device keys are deliberately separate. The service can authenticate an account and verify which public device key was valid when an event was accepted without ever generating or storing a document decryption key.

## Ordered work

- Validate Cognito sessions and establish cookie/CSRF handling for the browser control plane.
- Register client-generated signing and encryption public keys through authenticated device enrollment.
- Model active, rotated, and revoked device keys so historical event verification remains correct.
- Require signed device lifecycle events and authorization checks for enrollment, replacement, and revocation.
- Design and test explicit recovery limitations rather than silently granting old document access after password reset.

## Exit evidence

- Device ownership and accepted-time key status are queryable and auditable.
- A revoked device cannot append new events or receive newly issued envelopes.
- A password reset or new device enrollment cannot reconstruct an old document key without an explicit approved migration flow.

## Non-negotiable constraints

- Cognito is an identity service, not a document-key recovery service.
- Signing and encryption keys have distinct roles.
- Private keys remain client-generated and client-retained.
