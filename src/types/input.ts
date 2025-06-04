import { REGIONS } from '@/const/region'

export interface IInput {
  region: typeof REGIONS[number]
  providerId: `${string}-${string}-${string}-${string}-${string}`
  audience?: string
}