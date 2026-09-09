"""Writes the FastAPI app's OpenAPI schema to disk for the frontend generator to consume.

Run via `uv run python scripts/export_openapi.py` from apps/api, or `pnpm generate` from the repo root.
"""

import json
from pathlib import Path

from app.main import app

OUTPUT_PATH = Path(__file__).parent.parent / "openapi.json"


def main() -> None:
    schema = app.openapi()
    OUTPUT_PATH.write_text(json.dumps(schema, indent=2) + "\n")
    print(f"Wrote OpenAPI schema to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
