import { getInputs } from '@/utils/action/getInputs'
import { getIDToken } from '@actions/core'
import { IInput } from '@/types/input'
import { IOutput } from '@/types/output'

export async function login(): Promise<IOutput> {
  const inputs = getInputs()
  const jwt = await getIDToken(inputs.audience)
  const buddyToken = await mockGetBuddyToken(inputs, jwt)

  return { buddyToken }
}

async function mockGetBuddyToken(inputs: IInput, jwt: string): Promise<string> {
  void jwt
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        `mocked-token-for-${inputs.providerId}-${inputs.region || inputs.apiUrl}`,
      )
    }, 1000)
  })
}
