import { getInput } from '@actions/core'
import { IInput } from '@/types/input'
import { REGIONS } from '@/const/region'
import { isActionDebug } from '@/utils/action/isActionDebug'
import { logger } from '@/utils/action/logger'

/**
 * Retrieves and validates all action inputs
 * @returns Validated input configuration
 * @throws Error if any input is invalid
 */
export function getInputs(): IInput {
  const providerId = getInput('provider_id', { required: true })
  const audience = getInput('audience') || undefined
  const apiUrl = getInput('api_url') || undefined
  const debug = isActionDebug()

  if (!isProviderIdValid(providerId)) {
    throw new Error('Invalid provider ID format. Must be a valid UUID v4.')
  }

  if (!isAudienceValid(audience)) {
    throw new Error(
      'Invalid audience input. Must be a valid string or undefined.',
    )
  }

  if (apiUrl) {
    if (!isApiUrlValid(apiUrl)) {
      throw new Error('Invalid API URL format. Must be a valid HTTPS URL.')
    }

    return {
      apiUrl,
      providerId,
      audience,
      debug,
    }
  } else {
    const region = getInput('region', { required: true })

    if (!isRegionValid(region)) {
      throw new Error(
        `Invalid region input: ${region}. Must be one of ${Object.values(REGIONS).join(', ')}`,
      )
    }

    return {
      region,
      providerId,
      audience,
      debug,
    }
  }
}

function isRegionValid(region: string): region is (typeof REGIONS)[number] {
  return REGIONS.includes(region as (typeof REGIONS)[number])
}

function isProviderIdValid(
  providerId: string,
): providerId is `${string}-${string}-${string}-${string}-${string}` {
  const uuidV4Pattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  if (!uuidV4Pattern.test(providerId)) {
    return false
  }

  if (
    providerId !== providerId.toLowerCase() &&
    providerId !== providerId.toUpperCase()
  ) {
    logger.warn(
      'Warning: Provider ID contains mixed case. Consider using lowercase UUID format.',
    )
  }

  return true
}

function isAudienceValid(audience: string | undefined): boolean {
  if (audience === undefined) return true

  if (audience.length === 0) {
    throw new Error('Audience cannot be an empty string')
  }

  if (audience.length > 255) {
    throw new Error('Audience must be less than 256 characters')
  }

  const validPattern = /^[a-zA-Z0-9-._~:/?#@!$&'()*+,;=]+$/

  if (!validPattern.test(audience)) {
    throw new Error(
      'Audience contains invalid characters. Only alphanumeric and URI-safe characters are allowed.',
    )
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
