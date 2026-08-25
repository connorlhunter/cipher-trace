from app.main import app
from fastapi.testclient import TestClient


def test_health_is_non_sensitive() -> None:
    response = TestClient(app).get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
