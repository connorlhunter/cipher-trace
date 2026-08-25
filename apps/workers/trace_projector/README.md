# Trace projector Lambda

This worker consumes accepted immutable trace events to build query projections, notification intents, and optional checkpoint candidates. It treats the trace as authoritative and projections as replaceable derived state.

It must only consume opaque event fields, public keys, signatures, ciphertext commitments, and encrypted envelopes. It must not decrypt document content or create a server-authoritative statement about plaintext.
