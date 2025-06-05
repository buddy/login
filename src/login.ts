import { getInputs } from '@/utils/action/getInputs'
import { getIDToken } from '@actions/core'
import { IOutput } from '@/types/output'
import { ISecret } from '@/types/env'
import { IInput } from '@/types/input'

export async function login(): Promise<IOutput> {
  const inputs = getInputs()
  const jwt = await getIDToken(inputs.audience) as ISecret
  const data = await mockGetBuddyToken(inputs.region, inputs.providerId, jwt)
  return { jwt, data }
}


async function mockGetBuddyToken(region: IInput['region'], providerId: IInput['providerId'], jwt: ISecret): Promise<string> {
  void jwt
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`mocked-token-for-${region}-${providerId}`)
    }, 1000)
  })
}