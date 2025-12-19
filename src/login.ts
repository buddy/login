import { getInputs } from '@/utils/action/getInputs'
import { getIDToken } from '@actions/core'
import { IOutputs } from '@/types/outputs'
import { exchangeTokenWithBuddy } from '@/api/buddy'
import { API_URL } from '@/const/api_url'
import { REGIONS } from '@/const/region'

/**
 * Main login function that authenticates with Buddy using either API key or GitHub OIDC
 * @returns Promise containing the Buddy access token and API endpoint
 * @throws Error if authentication fails
 */
export async function login(): Promise<IOutputs> {
  const inputs = getInputs()

  let api_endpoint: string | undefined
  if ('api_url' in inputs && inputs.api_url) {
    api_endpoint = inputs.api_url
  } else if ('region' in inputs && inputs.region) {
    switch (inputs.region) {
      case REGIONS.EU:
        api_endpoint = API_URL.EU
        break
      case REGIONS.AP:
        api_endpoint = API_URL.AP
        break
      case REGIONS.US:
        api_endpoint = API_URL.US
        break
    }
  } else {
    api_endpoint = API_URL.US
  }

  let token: string | undefined

  if ('token' in inputs) {
    token = inputs.token
  } else {
    // Handle OIDC authentication
    const jwt = await getIDToken(inputs.audience)
    token = await exchangeTokenWithBuddy(inputs, jwt)
  }

  // Trim values before validation
  token = (token as typeof token | undefined)?.trim() || ''
  api_endpoint = (api_endpoint as typeof api_endpoint | undefined)?.trim() || ''

  // Defensive validation: ensure token is valid before returning
  // This catches any edge cases where an invalid token might slip through
  if (!token || typeof token !== 'string' || token.length === 0) {
    throw new Error(
      'Login failed: Invalid or empty token received. Please check your credentials and try again.',
    )
  }

  // Defensive validation: ensure api_endpoint is valid
  if (
    !api_endpoint ||
    typeof api_endpoint !== 'string' ||
    api_endpoint.length === 0
  ) {
    throw new Error('Login failed: Invalid API endpoint configuration')
  }

  return {
    token,
    api_endpoint,
  }
}
