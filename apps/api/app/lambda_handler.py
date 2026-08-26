"""Expose the FastAPI control plane through API Gateway and AWS Lambda.

The adapter only translates request and response formats. It must not add
background work or handle document content.
"""

from mangum import Mangum

from app.main import app

# Mangum adapts API Gateway events to ASGI. Durable work belongs in
# event-triggered workers, never FastAPI in-process background tasks.
handler = Mangum(app, lifespan="off")
