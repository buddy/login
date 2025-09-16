import { IInputs, IInputsOIDC } from '@/types/inputs'
import { logger } from '@/utils/action/logger'
import { setSecret } from '@actions/core'
import { API_URL } from '@/const/api_url'
import { REGIONS } from '@/const/region'

interface IssueTokenRequest {
  provider_id: string
  web_identity_token: string
}

interface IssueTokenResponse {
  token?: string
  access_token?: string
  [key: string]: unknown
}

function getApiBaseUrl(input: IInputs): string {
  if ('api_url' in input && input.api_url) {
    return input.api_url
  }

  if ('region' in input && input.region) {
    return input.region === REGIONS.EU ? API_URL.EU : API_URL.US
  }

  // Default fallback
  return API_URL.US
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  retryDelay = 1000,
): Promise<Response> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.debug(`[HTTP Request] ${options.method || 'GET'} ${url}`)
      logger.debug(
        `[HTTP Request Headers] ${JSON.stringify(options.headers || {})}`,
      )

      if (options.body) {
        logger.debug(`[HTTP Request Body] <hidden - contains sensitive data>`)
      }

      const startTime = Date.now()
      const response = await fetch(url, options)
      const duration = Date.now() - startTime

      logger.debug(
        `[HTTP Response] Status: ${String(response.status)} ${response.statusText} (${String(duration)}ms)`,
      )
      logger.debug(
        `[HTTP Response Headers] ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`,
      )
      logger.debug(`[HTTP Response URL] ${response.url}`)

      if (response.status >= 400 && response.status < 500) {
        return response
      }

      if (response.ok || attempt === maxRetries) {
        return response
      }

      lastError = new Error(
        `HTTP ${String(response.status)}: ${response.statusText}`,
      )
      logger.debug(
        `[HTTP Error] Server error, will retry: ${lastError.message}`,
      )
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Network error')
      logger.debug(`[HTTP Error] Network/fetch error: ${lastError.message}`)

      if (attempt === maxRetries) {
        logger.debug(`[HTTP Error] Max retries reached, failing`)
        throw lastError
      }
    }

    const delay = retryDelay * Math.pow(2, attempt - 1)
    logger.debug(
      `Retrying request (attempt ${String(attempt)}/${String(maxRetries)}) after ${String(delay)}ms...`,
    )
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  throw lastError || new Error('Failed after retries')
}

/**
 * Exchanges a GitHub OIDC token for a Buddy access token
 * @param inputs - Input configuration including provider ID, region/API URL, and debug settings
 * @param jwt - The JWT token obtained from GitHub's OIDC provider
 * @returns A Promise that resolves to the Buddy access token
 * @throws Error if the token exchange fails or response is invalid
 */
export async function exchangeTokenWithBuddy(
  inputs: IInputsOIDC,
  jwt: string,
): Promise<string> {
  const baseUrl = getApiBaseUrl(inputs)
  const endpoint = `${baseUrl}/user/oidc/tokens`

  const requestBody: IssueTokenRequest = {
    provider_id: inputs.provider_id,
    web_identity_token: jwt,
  }

  logger.debug(`Exchanging OIDC token with Buddy`)

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
    )

    const responseText = await response.text()
    setSecret(responseText)
    logger.debug(`Response status: ${String(response.status)}`)

    if (!response.ok) {
      let errorMessage = ''

      // Try to parse error response from backend
      try {
        const errorData = JSON.parse(responseText) as {
          errors?: Array<{ message?: string }>
          message?: string
        }

        // Extract error message from backend response
        if (errorData.errors && errorData.errors[0]?.message) {
          errorMessage = errorData.errors[0].message
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch {
        // Response is not valid JSON, use generic message
      }

      // If no backend message, use generic status-based message
      if (!errorMessage) {
        errorMessage = `Token exchange failed with status ${String(response.status)}`
      }

      throw new Error(
        `${errorMessage} (HTTP ${String(response.status)} ${response.statusText})`,
      )
    }

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (uuidPattern.test(responseText.trim())) {
      return responseText.trim()
    }

    let data: IssueTokenResponse
    try {
      data = JSON.parse(responseText) as IssueTokenResponse
    } catch {
      if (responseText.trim()) {
        return responseText.trim()
      }
      throw new Error(`Invalid response format: Not a valid token or JSON`)
    }

    const api_key = data.token || data.access_token || data.buddy_token

    if (!api_key || typeof api_key !== 'string') {
      logger.debug('Response was valid JSON but no token field found')
      throw new Error(
        'No token found in response. Expected fields: token, access_token, or buddy_token',
      )
    }

    logger.debug(`Token successfully extracted from JSON response`)

    return api_key
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Token exchange failed: ${error.message}`)
    }
    throw new Error('Token exchange failed with unknown error')
  }
}
