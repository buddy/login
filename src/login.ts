import { getInputs } from '@/utils/action/getInputs'
import { getIDToken } from '@actions/core'

export async function login() {
  const inputs = getInputs()
  const jwt = await getIDToken(inputs.audience)
  await Promise.resolve().then(() => {
  })
  return { output: jwt }
}

