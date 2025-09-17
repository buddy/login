import { exportVariable, setFailed, setOutput, setSecret } from '@actions/core'
import { login } from '@/login'
import { normalizeError } from '@/utils/error/normalizeError'

login()
  .then(({ token, api_endpoint }) => {
    setSecret(token)
    exportVariable('BUDDY_TOKEN', token)
    exportVariable('BUDDY_API_ENDPOINT', api_endpoint)
    setOutput('token', token)
    setOutput('api_endpoint', api_endpoint)
    process.exit(0)
  })
  .catch((error: unknown) => {
    setFailed(normalizeError(error))
    process.exit(1)
  })
