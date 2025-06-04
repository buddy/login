import { setFailed, getInput, setOutput } from '@actions/core'
import { context } from '@actions/github'

try {
  const nameToGreet = getInput('who-to-greet')
  console.log(`Hello ${nameToGreet}!`)
  const time = new Date().toTimeString()
  setOutput('time', time)
  const payload = JSON.stringify(context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`)
} catch (error: unknown) {
  setFailed(normalizeError(error))
}


function normalizeError(error: unknown): string | Error {
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