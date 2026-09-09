# schema-validation-poc

A small monorepo proving out one workflow: define a schema once in Python,
generate everything the frontend needs from it.

```
FastAPI + Pydantic  --(OpenAPI)-->  @hey-api/openapi-ts  --> TanStack Query hooks + Zod schemas
```

The domain is intentionally tiny (a `User` CRUD API) so the interesting part —
the codegen pipeline — stays easy to see.

## Layout

- [apps/api](apps/api) — FastAPI backend. `app/models.py` has the Pydantic
  schemas (`UserCreate`, `UserUpdate`, `User`); `app/routers/users.py` has the
  CRUD endpoints (in-memory store, no DB — this is a POC).
- [apps/web](apps/web) — Vite + React + TypeScript frontend. `src/client` is
  **generated, not committed** — see below.

## One-time setup

```bash
uv sync --project apps/api
pnpm install
```

## The codegen workflow

1. FastAPI derives an OpenAPI schema from the Pydantic models.
2. `apps/api/scripts/export_openapi.py` writes that schema to `apps/api/openapi.json`.
3. `apps/web/openapi-ts.config.ts` points `@hey-api/openapi-ts` at that file and
   generates, into `apps/web/src/client`:
   - `types.gen.ts` — TS types mirroring the Pydantic models
   - `sdk.gen.ts` / `client.gen.ts` — a typed fetch client
   - `@tanstack/react-query.gen.ts` — `xOptions` / `xMutation` helpers for `useQuery`/`useMutation`
   - `zod.gen.ts` — Zod schemas (e.g. `zUserCreate`) mirroring the same models, used to
     validate the create/edit form client-side before it ever hits the network

Run the whole pipeline with:

```bash
pnpm generate
```

Do this once after `pnpm install`, and again any time you change a Pydantic
model or endpoint in `apps/api`.

## Testing the API seam

The generated SDK doesn't just get TypeScript *types* from the OpenAPI schema —
`openapi-ts.config.ts` also turns on the `zod` plugin's response validator
(`{ name: '@hey-api/sdk', validator: { response: true } }`), so every response
is parsed through the matching `zod.gen.ts` schema at runtime, not just cast to
a type at compile time.

To see this catch something, `GET /users/999` (see `MALFORMED_USER_ID` in
[apps/api/app/routers/users.py](apps/api/app/routers/users.py)) always returns
a payload that violates the `User` schema — it bypasses FastAPI's
`response_model` by returning a raw `JSONResponse`, simulating a backend that
has drifted from its own declared contract. In the app, click **View user 999
(always returns a schema-invalid response)** on the user list, or open any
user's detail page normally to see the happy path.

This is also why `main.tsx` configures `QueryClient` to never retry a schema
validation failure: retrying can't fix a payload that will never match the
schema, so the app fails fast and shows the Zod issues instead of spinning.

## Running it

```bash
pnpm generate   # if you haven't already
pnpm dev        # runs the API (uvicorn --reload, :8000) and the web app (vite, :5173) together
```

Then open http://localhost:5173.

Other scripts:

- `pnpm api:test` — backend tests (pytest)
- `apps/web`: `pnpm lint`, `tsc -b --noEmit` for the frontend

## Why nothing is committed twice

`apps/api/openapi.json` and `apps/web/src/client/**` are both gitignored. They're
derived artifacts of the Pydantic models — committing them would let the two
sides drift out of sync silently. Running `pnpm generate` is the single source
of truth that keeps the frontend's types and validation rules honest to what
the backend actually accepts.
