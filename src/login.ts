import { getInputs } from '@/utils/action/getInputs'

export async function login() {
  const inputs = getInputs()
  await Promise.resolve().then(() => {
  })
  return { output: inputs.providerId, message: 'Login successful' }
}

