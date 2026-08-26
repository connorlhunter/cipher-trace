"""Strict, non-cryptographic control-plane contracts.

This module validates field shape only. Canonical serialization, signature
algorithms, encryption, and ciphertext processing remain intentionally outside
this library until their versioned protocols are approved.
"""

from collections.abc import Iterator, Mapping
from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from cipher_trace_core.identifiers import OpaqueIdentifier

# These names could carry plaintext or document keys. The boundary rejects
# them before a payload is accepted as control-plane data.
FORBIDDEN_CONTROL_PLANE_FIELDS = frozenset(
    {
        "comment",
        "content",
        "document_bytes",
        "document_content",
        "document_key",
        "file_name",
        "filename",
        "key_material",
        "plaintext",
        "plaintext_commitment",
        "plaintext_hash",
        "private_key",
        "title",
    }
)


class TraceEventType(StrEnum):
    """Workflow events the control plane may record for a document revision."""

    REVISION_CREATED = "revision.created"
    REVISION_SUBMITTED = "revision.submitted"
    APPROVAL_RECORDED = "approval.recorded"
    APPROVAL_REJECTED = "approval.rejected"
    WORKFLOW_COMPLETED = "workflow.completed"
    WORKFLOW_CANCELLED = "workflow.cancelled"


class TraceEvent(BaseModel):
    """A strict event envelope made only of server-visible opaque values.

    The envelope links a revision, signer, policy, digest, and signature. It
    does not carry document content, document keys, or readable metadata.
    """

    model_config = ConfigDict(extra="forbid", frozen=True)

    schema_version: Literal["1"]
    event_id: OpaqueIdentifier
    document_id: OpaqueIdentifier
    revision_id: OpaqueIdentifier
    event_type: TraceEventType
    actor_key_id: OpaqueIdentifier
    policy_id: OpaqueIdentifier
    policy_version: int = Field(ge=1)
    previous_event_digest: str | None = Field(default=None, min_length=16, max_length=256)
    event_digest: str = Field(min_length=16, max_length=256)
    signature: str = Field(min_length=16, max_length=16384)
    encrypted_metadata_envelope: str | None = Field(default=None, min_length=1, max_length=65536)


def find_prohibited_field_paths(payload: Mapping[str, object]) -> tuple[str, ...]:
    """List payload paths whose names suggest plaintext or document-key data.

    Args:
        payload: The nested control-plane payload to inspect.

    Returns:
        Paths to prohibited field names, in traversal order.
    """

    return tuple(_find_prohibited_field_paths(payload))


def assert_no_plaintext_fields(payload: Mapping[str, object]) -> None:
    """Reject a payload that contains plaintext or document-key field names.

    Args:
        payload: The nested control-plane payload to inspect.

    Raises:
        ValueError: If a prohibited field name is present.
    """

    prohibited_paths = find_prohibited_field_paths(payload)
    if prohibited_paths:
        raise ValueError(
            "Control-plane payload contains prohibited fields: " + ", ".join(prohibited_paths)
        )


def _find_prohibited_field_paths(value: object, path: str = "") -> Iterator[str]:
    if isinstance(value, Mapping):
        for raw_name, nested_value in value.items():
            if not isinstance(raw_name, str):
                continue

            field_path = raw_name if not path else path + "." + raw_name
            if _normalise_field_name(raw_name) in FORBIDDEN_CONTROL_PLANE_FIELDS:
                yield field_path

            yield from _find_prohibited_field_paths(nested_value, field_path)
    elif isinstance(value, list):
        for index, nested_value in enumerate(value):
            yield from _find_prohibited_field_paths(nested_value, path + "[" + str(index) + "]")


def _normalise_field_name(field_name: str) -> str:
    return field_name.strip().casefold().replace("-", "_")
