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

  // Determine API endpoint based on inputs (same for both auth methods)
  let api_endpoint: string
  if ('api_url' in inputs && inputs.api_url) {
    api_endpoint = inputs.api_url
  } else if ('region' in inputs && inputs.region) {
    api_endpoint = inputs.region === REGIONS.EU ? API_URL.EU : API_URL.US
  } else {
    api_endpoint = API_URL.US
  }

  // Handle API key authentication
  if ('api_key' in inputs) {
    // For API key auth, we just return the provided key
    return {
      api_key: inputs.api_key,
      api_endpoint,
    }
  }

  // Handle OIDC authentication
  const jwt = await getIDToken(inputs.audience)
  const api_key = await exchangeTokenWithBuddy(inputs, jwt)

  return {
    api_key,
    api_endpoint,
  }
}
