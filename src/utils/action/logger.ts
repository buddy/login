import { isActionDebug } from '@/utils/action/isActionDebug'

class Logger {
  #instance: Logger | null = null
  #isDebugMode = isActionDebug()

  constructor() {
    if (!this.#instance) {
      this.#instance = this
      return this.#instance
    }
  }

  log(...data: unknown[]) {
    console.log('[LOG]', ...data)
  }

  error(...data: unknown[]) {
    console.error('[ERROR]', ...data)
  }

  warn(...data: unknown[]) {
    console.warn('[WARN]', ...data)
  }

  debug(...data: unknown[]) {
    if (!this.#isDebugMode) return
    console.debug('[DEBUG]', ...data)
  }
}

export const logger = new Logger()
