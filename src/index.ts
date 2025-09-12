import { exportVariable, setFailed, setOutput, setSecret } from '@actions/core'
import { login } from '@/login'
import { normalizeError } from '@/utils/error/normalizeError'

login()
  .then(({ api_key, api_endpoint }) => {
    setSecret(api_key)
    exportVariable('BUDDY_TOKEN', api_key)
    exportVariable('BUDDY_API_ENDPOINT', api_endpoint)
    setOutput('api_key', api_key)
    setOutput('api_endpoint', api_endpoint)
    process.exit(0)
  })
  .catch((error: unknown) => {
    setFailed(normalizeError(error))
    process.exit(1)
  })
