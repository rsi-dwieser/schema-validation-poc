import { defineConfig } from '@hey-api/openapi-ts';

const plugins = [
  '@hey-api/client-fetch',
  '@hey-api/typescript',
  'zod',
  {
    name: '@hey-api/sdk',
    // Parses every response through the matching `zod.gen.ts` schema at runtime,
    // so a backend payload that drifts from the OpenAPI contract (see the
    // MALFORMED_USER_ID sentinel in the API) fails loudly instead of silently
    // flowing through as if it were valid `User` data.
    validator: { response: true },
  },
  {
    name: '@tanstack/react-query',
    queryOptions: true,
    mutationOptions: true,
  },
] as const;

// Each entry below is a fully independent generation job: same OpenAPI source,
// filtered to one tag, written to its own subdirectory. This physically splits
// the generated files by resource (src/client/users vs. src/client/posts)
// instead of one sdk.gen.ts/zod.gen.ts covering every endpoint. The tradeoff is
// that each job regenerates its own copy of the fetch client core, so there are
// two independent clients to `setConfig()` in main.tsx rather than one shared
// one — worth it here to actually see the split, but weigh it against sharing
// a single client if the domain grows much further.
export default defineConfig([
  {
    input: '../api/openapi.json',
    output: 'src/client/users',
    parser: { filters: { tags: { include: ['users'] } } },
    plugins,
  },
  {
    input: '../api/openapi.json',
    output: 'src/client/posts',
    parser: { filters: { tags: { include: ['posts'] } } },
    plugins,
  },
]);
