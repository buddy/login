import { REGIONS } from '@/const/region'

interface IInputBase {
  providerId: `${string}-${string}-${string}-${string}-${string}`
  audience?: string
}

interface IInputWithRegion extends IInputBase {
  region: (typeof REGIONS)[number]
  apiUrl?: never
}

interface IInputWithApiUrl extends IInputBase {
  region?: never
  apiUrl: string
}

export type IInput = IInputWithRegion | IInputWithApiUrl
