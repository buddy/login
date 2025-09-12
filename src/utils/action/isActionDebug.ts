import { getInput } from '@actions/core'

export const isActionDebug = (): boolean =>
  getInput('debug').toLowerCase() === 'true'
