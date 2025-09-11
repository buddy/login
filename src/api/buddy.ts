import { IInput } from '@/types/input'
import { setSecret } from '@actions/core'

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

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  retryDelay = 1000,
  debug = false,
): Promise<Response> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)

      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response
      }

      // Retry on server errors (5xx) or network errors
      if (response.ok || attempt === maxRetries) {
        return response
      }

      lastError = new Error(
        `HTTP ${String(response.status)}: ${response.statusText}`,
      )
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Network error')

      if (attempt === maxRetries) {
        throw lastError
      }
    }

    // Wait before retrying with exponential backoff
    const delay = retryDelay * Math.pow(2, attempt - 1)
    if (debug) {
      console.log(
        `[DEBUG] Retrying request (attempt ${String(attempt)}/${String(maxRetries)}) after ${String(delay)}ms...`,
      )
    }
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  throw lastError || new Error('Failed after retries')
}

/**
 * Exchanges a GitHub OIDC token for a Buddy access token
 * @param input - Input configuration including provider ID, region/API URL, and debug settings
 * @param githubToken - The JWT token obtained from GitHub's OIDC provider
 * @returns A Promise that resolves to the Buddy access token
 * @throws Error if the token exchange fails or response is invalid
 */
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

  if (input.debug) {
    console.log(`[DEBUG] Exchanging OIDC token with Buddy`)
    console.log(`[DEBUG] Endpoint: ${endpoint}`)
    console.log(`[DEBUG] Provider ID: ${input.providerId}`)
    console.log(`[DEBUG] Audience: ${input.audience || 'default'}`)
    console.log(`[DEBUG] Token length: ${String(githubToken.length)}`)
  }

  try {
    const response = await fetchWithRetry(
      endpoint,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      },
      3,
      1000,
      input.debug,
    )

    const responseText = await response.text()
    setSecret(responseText)

    if (input.debug) {
      console.log(`[DEBUG] Response status: ${String(response.status)}`)
      console.log(`[DEBUG] Response body: ${responseText}`)
    }

    if (!response.ok) {
      let errorMessage = `Failed to exchange OIDC token with Buddy API`

      switch (response.status) {
        case 400:
          errorMessage = `Invalid request: Check provider_id format and ensure it's registered in Buddy`
          break
        case 401:
          errorMessage = `Authentication failed: GitHub OIDC token may be invalid or expired`
          break
        case 403:
          errorMessage = `Authorization failed: Provider may not be configured correctly in Buddy`
          break
        case 404:
          errorMessage = `Provider not found: Check that provider_id exists in your Buddy workspace`
          break
        case 500:
        case 502:
        case 503:
          errorMessage = `Buddy API service error: Please try again later`
          break
      }

      throw new Error(
        `${errorMessage}\nStatus: ${String(response.status)} ${response.statusText}\nResponse: ${responseText}`,
      )
    }

    // Check if response is plain text token (UUID format) or JSON
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (uuidPattern.test(responseText.trim())) {
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
      if (input.debug) {
        console.log(
          '[DEBUG] Full response object:',
          JSON.stringify(data, null, 2),
        )
      }
      throw new Error(
        'No token found in response. Check the response structure in debug mode.',
      )
    }

    if (input.debug) {
      console.log(
        `[DEBUG] Token received (first 8 chars): ${token.substring(0, 8)}...`,
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
