import { exportVariable, setFailed } from '@actions/core'
import { login } from '@/login'
import { normalizeError } from '@/utils/error/normalizeError'

login()
  .then(({ buddyToken }) => {
    exportVariable('BUDDY_TOKEN', buddyToken)
    process.exit(0)
  })
  .catch((error: unknown) => {
    setFailed(normalizeError(error))
    process.exit(1)
  })
