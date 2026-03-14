import type { AppApi } from '../shared/ipc'

declare global {
  interface Window {
    electron: {
      process: {
        versions: NodeJS.ProcessVersions
      }
    }
    api: AppApi
  }
}
