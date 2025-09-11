import { exportVariable, setFailed, setOutput, setSecret } from '@actions/core'
import { login } from '@/login'
import { normalizeError } from '@/utils/error/normalizeError'

login()
  .then(({ buddyToken }) => {
    console.debug({ buddyToken })
    setSecret(buddyToken) // Set the token value as secret to mask it in logs
    exportVariable('BUDDY_TOKEN', buddyToken)
    setOutput('token', buddyToken)
    process.exit(0)
  })
  .catch((error: unknown) => {
    setFailed(normalizeError(error))
    process.exit(1)
  })
