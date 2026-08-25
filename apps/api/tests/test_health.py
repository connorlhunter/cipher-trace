from app.lambda_handler import handler
from app.main import app
from fastapi.testclient import TestClient


def test_health_is_non_sensitive() -> None:
    response = TestClient(app).get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_lambda_handler_is_configured_for_the_control_plane() -> None:
    assert handler is not None
