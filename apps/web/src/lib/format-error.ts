import type { HttpValidationError } from '../client/types.gen'

function isValidationError(error: unknown): error is HttpValidationError {
  return typeof error === 'object' && error !== null && 'detail' in error
}

export function formatApiError(error: unknown): string {
  if (!error) return ''
  if (isValidationError(error) && error.detail?.length) {
    return error.detail.map((issue) => issue.msg).join(', ')
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong.'
}
