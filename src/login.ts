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

  let api_endpoint: string
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

  if ('token' in inputs) {
    return {
      token: inputs.token,
      api_endpoint,
    }
  }

  // Handle OIDC authentication
  const jwt = await getIDToken(inputs.audience)
  const token = await exchangeTokenWithBuddy(inputs, jwt)

  return {
    token,
    api_endpoint,
  }
}
