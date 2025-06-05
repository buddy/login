import { ISecret } from '@/types/env'

export interface IOutput {
  jwt: ISecret;
  data: unknown;
  ACTIONS_ID_TOKEN_REQUEST_TOKEN?: string;
  ACTIONS_ID_TOKEN_REQUEST_URL?: string;
}
