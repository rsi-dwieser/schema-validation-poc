import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: '../api/openapi.json',
  output: 'src/client',
  plugins: [
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
      // Groups generated SDK functions into one class per OpenAPI tag
      // (Users, Posts, ...) so the code reads as organized-by-resource without
      // splitting shared pieces (the fetch client core, ValidationError, etc.)
      // into separate physical output trees.
      operations: { strategy: 'byTags' },
    },
    {
      name: '@tanstack/react-query',
      queryOptions: true,
      mutationOptions: true,
    },
  ],
});
