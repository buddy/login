import { IInput } from '@/types/input'

interface IssueTokenRequest {
  provider_id: string
  web_identity_token: string
}

interface IssueTokenResponse {
  token?: string
  access_token?: string
  [key: string]: unknown
}

function getApiBaseUrl(input: IInput): string {
  if (input.apiUrl) {
    return input.apiUrl
  }

  // Production region URLs
  switch (input.region) {
    case 'EU':
      return 'https://api.eu.buddy.works'
    case 'US':
      return 'https://api.buddy.works'
    default:
      return 'https://api.buddy.works'
  }
}

export async function exchangeTokenWithBuddy(
  input: IInput,
  githubToken: string,
): Promise<string> {
  const baseUrl = getApiBaseUrl(input)
  const endpoint = `${baseUrl}/user/oidc/tokens`

  const requestBody: IssueTokenRequest = {
    provider_id: input.providerId,
    web_identity_token: githubToken,
  }

  console.log(`Exchanging OIDC token with Buddy at ${endpoint}`)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const responseText = await response.text()
    console.log(`Response status: ${String(response.status)}`)
    console.log(`Response body: ${responseText}`)

    if (!response.ok) {
      throw new Error(
        `Failed to exchange token: ${String(response.status)} ${response.statusText}\nResponse: ${responseText}`,
      )
    }

    // Check if response is plain text token (UUID format) or JSON
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (uuidPattern.test(responseText.trim())) {
      // Response is the token directly as plain text
      return responseText.trim()
    }

    // Try to parse as JSON if not a plain UUID
    let data: IssueTokenResponse
    try {
      data = JSON.parse(responseText) as IssueTokenResponse
    } catch {
      // If not valid JSON and not UUID, assume it's the token as plain text
      if (responseText.trim()) {
        return responseText.trim()
      }
      throw new Error(`Invalid response format: ${responseText}`)
    }

    // Try different possible token field names in JSON response
    const token = data.token || data.access_token || data.buddy_token

    if (!token || typeof token !== 'string') {
      console.log('Full response object:', JSON.stringify(data, null, 2))
      throw new Error(
        'No token found in response. Check the response structure above.',
      )
    }

    return token
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Token exchange failed: ${error.message}`)
    }
    throw new Error('Token exchange failed with unknown error')
  }
}
