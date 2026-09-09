from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import posts, users

app = FastAPI(
    title="Schema Validation POC API",
    description="Minimal Users/Posts API used to demonstrate FastAPI -> OpenAPI -> hey-api codegen.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(posts.router)


@app.get("/health", operation_id="health")
def health() -> dict[str, str]:
    return {"status": "ok"}
