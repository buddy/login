import { REGIONS } from '@/const/region'

type IInputsBase = {
  debug: boolean
}

type IInputsAuthBase = IInputsBase & {
  audience?: string
}

type IInputsOIDCBase = IInputsAuthBase & {
  provider_id: `${string}-${string}-${string}-${string}-${string}`
}

type IInputsPATBase = IInputsAuthBase & {
  api_key: `${string}-${string}-${string}-${string}-${string}`
}

type IInputsOIDCWithRegion = IInputsOIDCBase & {
  region: REGIONS
  api_url?: never
}

type IInputsOIDCWithApiUrl = IInputsOIDCBase & {
  region?: never
  api_url: string
}

type IInputsPATWithRegion = IInputsPATBase & {
  region: REGIONS
  api_url?: never
}

type IInputsPATWithApiUrl = IInputsPATBase & {
  region?: never
  api_url: string
}

type IInputsOIDC = IInputsOIDCWithRegion | IInputsOIDCWithApiUrl
type IInputsPAT = IInputsPATWithRegion | IInputsPATWithApiUrl

type IInputs = IInputsOIDC | IInputsPAT

export type { IInputs, IInputsOIDC, IInputsPAT }
