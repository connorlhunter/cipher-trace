"""FastAPI control-plane skeleton.

This application intentionally accepts no document bytes or document-key
material. Future routes must validate only opaque identifiers, public keys,
signatures, encrypted envelopes, checksums, and workflow-control data.
"""

from fastapi import FastAPI

app = FastAPI(
    title="Cipher Trace API",
    version="0.1.0a3",
    description=(
        "Control-plane API for encrypted document provenance. "
        "It must never decrypt or proxy document plaintext."
    ),
)


@app.get("/health", tags=["operational"])
async def health() -> dict[str, str]:
    """Return a public liveness response without trace or document data."""

    return {"status": "ok"}
