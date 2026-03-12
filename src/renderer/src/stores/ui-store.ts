import { create } from 'zustand'

type UIStoreState = {
  metaText: string
  setMetaText: (value: string) => void
  hydrateMeta: () => Promise<void>
}

export const useUIStore = create<UIStoreState>((set) => ({
  metaText: 'Loading runtime metadata...',

  setMetaText: (value) => {
    set({ metaText: value })
  },

  hydrateMeta: async () => {
    try {
      const [meta, ping] = await Promise.all([window.api.getAppMeta(), window.api.ping()])
      set({
        metaText: `${meta.name} v${meta.version} on ${meta.platform} (ipc ok: ${ping.ok ? 'yes' : 'no'})`
      })
    } catch {
      set({ metaText: 'IPC unavailable' })
    }
  }
}))
