import type { HttpValidationError } from '../client/types.gen'

type ZodLikeError = {
  issues: Array<{ path: Array<PropertyKey>; message: string }>
}

function isValidationError(error: unknown): error is HttpValidationError {
  return typeof error === 'object' && error !== null && 'detail' in error
}

// The generated SDK runs every response through a Zod schema (see `validator` in
// openapi-ts.config.ts), so a backend payload that violates the OpenAPI contract
// surfaces here as a ZodError instead of as bad data silently reaching the UI.
export function isSchemaValidationError(error: unknown): error is ZodLikeError {
  return typeof error === 'object' && error !== null && Array.isArray((error as ZodLikeError).issues)
}

export function formatApiError(error: unknown): string {
  if (!error) return ''
  if (isSchemaValidationError(error)) {
    return error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ')
  }
  if (isValidationError(error) && error.detail?.length) {
    return error.detail.map((issue) => issue.msg).join(', ')
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong.'
}
