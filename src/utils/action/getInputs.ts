import { getInput } from '@actions/core'
import { IInputs } from '@/types/inputs'
import { REGIONS } from '@/const/region'
import { isActionDebug } from '@/utils/action/isActionDebug'

/**
 * Retrieves and validates all action inputs
 * @returns Validated input configuration
 * @throws Error if any input is invalid
 */
export function getInputs(): IInputs {
  const api_key = getInput('api_key') || undefined
  const provider_id = getInput('provider_id') || undefined
  const audience = getInput('audience') || undefined
  const api_url = getInput('api_url') || undefined
  const region = getInput('region') || undefined
  const debug = isActionDebug()

  // Validate audience if provided
  if (!isAudienceValid(audience)) {
    throw new Error(
      'Invalid audience input. Must be a valid string or undefined.',
    )
  }

  // Determine authentication method
  // Prioritize API key authentication
  if (api_key) {
    if (!isApiKeyValid(api_key)) {
      throw new Error('Invalid API key: cannot be empty')
    }

    // API key auth also needs region or api_url
    if (api_url) {
      if (!isApiUrlValid(api_url)) {
        throw new Error('Invalid API URL format. Must be a valid HTTPS URL.')
      }

      return {
        api_key,
        api_url,
        audience,
        debug,
      }
    }

    // Fall back to region for API key auth
    if (!region) {
      throw new Error(
        'Either api_url or region must be provided when using API key authentication.',
      )
    }

    if (!isRegionValid(region)) {
      throw new Error(
        `Invalid region input: ${region}. Must be one of ${Object.values(REGIONS).join(', ')}`,
      )
    }

    return {
      api_key,
      region,
      audience,
      debug,
    }
  }

  // Fall back to OIDC authentication
  if (!provider_id) {
    throw new Error(
      'Either api_key or provider_id must be provided for authentication.',
    )
  }

  if (!isProviderIdValid(provider_id)) {
    throw new Error('Invalid provider_id: cannot be empty')
  }

  // Prioritize api_url over region for OIDC
  if (api_url) {
    if (!isApiUrlValid(api_url)) {
      throw new Error('Invalid API URL format. Must be a valid HTTPS URL.')
    }

    return {
      api_url,
      provider_id,
      audience,
      debug,
    }
  }

  // Fall back to region for OIDC
  if (!region) {
    throw new Error(
      'Either api_url or region must be provided when using OIDC authentication (provider_id).',
    )
  }

  if (!isRegionValid(region)) {
    throw new Error(
      `Invalid region input: ${region}. Must be one of ${Object.values(REGIONS).join(', ')}`,
    )
  }

  return {
    region,
    provider_id,
    audience,
    debug,
  }
}

function isRegionValid(region: string): region is REGIONS {
  return Object.values(REGIONS).includes(region as REGIONS)
}

function isProviderIdValid(
  providerId: string,
): providerId is `${string}-${string}-${string}-${string}-${string}` {
  // Just check it's not empty and has reasonable length
  // Let the backend validate the actual format
  if (!providerId || providerId.trim().length === 0) {
    return false
  }

  // Reasonable max length check
  if (providerId.length > 255) {
    return false
  }

  return true
}

function isApiKeyValid(
  apiKey: string,
): apiKey is `${string}-${string}-${string}-${string}-${string}` {
  // Just check it's not empty and has reasonable length
  // Let the backend validate the actual format
  if (!apiKey || apiKey.trim().length === 0) {
    return false
  }

  // Reasonable max length check
  if (apiKey.length > 255) {
    return false
  }

  return true
}

function isAudienceValid(audience: string | undefined): boolean {
  if (audience === undefined) return true

  // Just check it's not empty if provided
  // Let the backend validate the actual format and characters
  if (audience.length === 0) {
    throw new Error('Audience cannot be an empty string')
  }

  // Reasonable max length check
  if (audience.length > 1024) {
    throw new Error('Audience is too long (max 1024 characters)')
  }

  return true
}

function isApiUrlValid(apiUrl: string): boolean {
  try {
    const url = new URL(apiUrl)
    return url.protocol === 'https:'
  } catch {
    return false
  }
}
