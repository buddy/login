import { setFailed, setOutput } from '@actions/core'
import { login } from '@/login'
import { normalizeError } from '@/utils/error/normalizeError'


login()
  .then(({ output }) => {
    setOutput('output', output)
    process.exit(0)
  })
  .catch((error: unknown) => {
    setFailed(normalizeError(error))
    process.exit(1)
  })

// try {
//   const region = getInput('region', { required: true })
//   console.log(`Hello ${nameToGreet}!`)
//   const time = new Date().toTimeString()
//   setOutput('time', time)
//   const payload = JSON.stringify(context.payload, undefined, 2)
//   console.log(`The event payload: ${payload}`)
// } catch (error: unknown) {
//   setFailed(normalizeError(error))
// }