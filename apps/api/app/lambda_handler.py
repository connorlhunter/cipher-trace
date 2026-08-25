"""AWS Lambda adapter for the FastAPI control plane."""

from mangum import Mangum

from app.main import app

# Mangum adapts API Gateway events to ASGI. Durable work belongs in
# event-triggered workers, never FastAPI in-process background tasks.
handler = Mangum(app, lifespan="off")
