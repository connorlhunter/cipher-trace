"""Opaque identifier constraints shared by control-plane contracts.

Identifiers are stable references, not document titles, filenames, or
plaintext metadata.
"""

from typing import Annotated

from pydantic import Field

OPAQUE_IDENTIFIER_PATTERN = r"^[A-Za-z0-9_-]+$"

type OpaqueIdentifier = Annotated[
    str,
    Field(
        min_length=16,
        max_length=128,
        pattern=OPAQUE_IDENTIFIER_PATTERN,
    ),
]
