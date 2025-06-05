import { setFailed, setOutput } from '@actions/core'
import { login } from '@/login'
import { normalizeError } from '@/utils/error/normalizeError'


login()
  .then(({ data }) => {
    setOutput('data', data)
    process.exit(0)
  })
  .catch((error: unknown) => {
    setFailed(normalizeError(error))
    process.exit(1)
  })