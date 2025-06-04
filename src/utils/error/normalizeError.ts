export function normalizeError(error: unknown): string | Error {
  if (error instanceof Error) {
    return error
  }
  if (typeof error === 'string') {
    return error
  }
  if (
    error !== null &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }
  if (error !== null && error !== undefined) {
    try {
      return JSON.stringify(error)
    } catch {
      return 'An error occurred (non-serializable)'
    }
  }
  return 'An unknown error occurred'
}
