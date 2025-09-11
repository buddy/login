import { getInputs } from '@/utils/action/getInputs'
import { getIDToken } from '@actions/core'
import { IOutput } from '@/types/output'
import { exchangeTokenWithBuddy } from '@/api/buddy'

/**
 * Main login function that authenticates with Buddy using GitHub OIDC
 * @returns Promise containing the Buddy access token
 * @throws Error if authentication fails
 */
export async function login(): Promise<IOutput> {
  const inputs = getInputs()
  const jwt = await getIDToken(inputs.audience)
  const buddyToken = await exchangeTokenWithBuddy(inputs, jwt)

  return { buddyToken }
}
