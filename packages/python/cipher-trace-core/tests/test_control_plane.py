from typing import Any

import pytest
from cipher_trace_core import (
    TraceEvent,
    TraceEventType,
    assert_no_plaintext_fields,
    find_prohibited_field_paths,
)
from pydantic import ValidationError


def valid_trace_event() -> dict[str, Any]:
    return {
        "schema_version": "1",
        "event_id": "event_000000000001",
        "document_id": "document_000000001",
        "revision_id": "revision_000000001",
        "event_type": "approval.recorded",
        "actor_key_id": "devicekey_00000001",
        "policy_id": "policy_0000000001",
        "policy_version": 1,
        "previous_event_digest": "digest_0000000001",
        "event_digest": "digest_0000000002",
        "signature": "signature_00000001",
        "encrypted_metadata_envelope": "envelope_000000001",
    }


def test_trace_event_accepts_opaque_control_plane_values() -> None:
    event = TraceEvent.model_validate(valid_trace_event())

    assert event.event_type is TraceEventType.APPROVAL_RECORDED
    assert event.document_id == "document_000000001"


def test_trace_event_rejects_plaintext_field_names() -> None:
    payload = valid_trace_event()
    payload["plaintext"] = "confidential document body"

    with pytest.raises(ValidationError, match="plaintext"):
        TraceEvent.model_validate(payload)


def test_boundary_finds_nested_plaintext_fields() -> None:
    payload = {
        "event_id": "event_000000000001",
        "encrypted_metadata_envelope": {
            "nested": {
                "document-key": "not allowed",
            }
        },
    }

    assert find_prohibited_field_paths(payload) == (
        "encrypted_metadata_envelope.nested.document-key",
    )

    with pytest.raises(ValueError, match="document-key"):
        assert_no_plaintext_fields(payload)


def test_boundary_handles_list_values_and_non_string_mapping_keys() -> None:
    payload = {
        "revisions": [{"file-name": "not allowed"}],
        "ignored": {1: {"title": "not traversed through a non-string key"}},
    }

    assert find_prohibited_field_paths(payload) == ("revisions[0].file-name",)
