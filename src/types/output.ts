import { ISecret } from '@/types/env'

export interface IOutput {
  jwt: ISecret;
  data: unknown;
}
