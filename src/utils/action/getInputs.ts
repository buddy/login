import { getInput } from '@actions/core'
import { IInput } from '@/types/input'
import { REGIONS } from '@/const/region'

export function getInputs(): IInput {
  const providerId = getInput('provider_id', { required: true })
  const audience = getInput('audience') || undefined
  const apiUrl = getInput('api_url') || undefined

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
    }
  }
}

function isRegionValid(region: string): region is (typeof REGIONS)[number] {
  return REGIONS.includes(region as (typeof REGIONS)[number])
}

function isProviderIdValid(
  providerId: string,
): providerId is `${string}-${string}-${string}-${string}-${string}` {
  return /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
    providerId,
  )
}

function isAudienceValid(audience: string | undefined): boolean {
  if (audience === undefined) return true
  return /^[a-zA-Z0-9-._~:/?#@!$&'()*+,;=]+$/.test(audience)
}

function isApiUrlValid(apiUrl: string): boolean {
  try {
    const url = new URL(apiUrl)
    return url.protocol === 'https:'
  } catch {
    return false
  }
}
