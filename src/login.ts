import { getInputs } from '@/utils/action/getInputs'
import { getIDToken } from '@actions/core'
import { IOutput } from '@/types/output'
import { ISecret } from '@/types/env'

export async function login(): Promise<IOutput> {
  const inputs = getInputs()
  const jwt = await getIDToken(inputs.audience) as ISecret
  const response = await fetch('https://jsonplaceholder.typicode.com/posts')
  const data = await response.json()
  return { jwt, data }
}

