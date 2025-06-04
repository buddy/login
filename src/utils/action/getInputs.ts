import { getInput } from '@actions/core'
import { IInput } from '@/types/input'
import { REGIONS } from '@/const/region'

export function getInputs(): IInput {
  const region = getInput('region', { required: true })
  const providerId = getInput('provider_id', { required: true })
  const audience = getInput('audience') || undefined

  if (!isRegionValid(region)) {
    throw new Error(`Invalid region input: ${region}. Must be one of ${Object.values(REGIONS).join(', ')}`)
  }

  if (!isProviderIdValid(providerId)) {
    throw new Error('Invalid provider ID format. Must be a valid UUID v4.')
  }

  if (!isAudienceValid(audience)) {
    throw new Error('Invalid audience input. Must be a valid string or undefined.')
  }

  return {
    region,
    providerId,
    audience
  }
}

function isRegionValid(region: string): region is IInput['region'] {
  return REGIONS.includes(region as IInput['region'])
}

function isProviderIdValid(providerId: string): providerId is IInput['providerId'] {
  return /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(providerId)
}

function isAudienceValid(audience: string | undefined): audience is IInput['audience'] {
  if (!audience) return true
  return /^[a-zA-Z0-9-._~:/?#@!$&'()*+,;=]+$/.test(audience)
}