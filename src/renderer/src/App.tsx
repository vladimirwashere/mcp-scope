import { useEffect, useState } from 'react'

function App(): React.JSX.Element {
  const [metaText, setMetaText] = useState('Loading runtime metadata...')

  useEffect(() => {
    let mounted = true

    const load = async (): Promise<void> => {
      try {
        const [meta, ping] = await Promise.all([window.api.getAppMeta(), window.api.ping()])
        if (!mounted) {
          return
        }
        setMetaText(
          `${meta.name} v${meta.version} on ${meta.platform} (ipc ok: ${ping.ok ? 'yes' : 'no'})`
        )
      } catch {
        if (mounted) {
          setMetaText('IPC unavailable')
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="h-screen bg-slate-950 text-slate-100">
      <div className="grid h-full grid-rows-[1fr_220px]">
        <div className="grid min-h-0 grid-cols-[300px_1fr]">
          <aside className="border-r border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">MCP Scope</div>
            <h1 className="mt-2 text-lg font-semibold">Servers</h1>
            <div className="mt-4 rounded border border-dashed border-slate-700 p-4 text-sm text-slate-400">
              No servers configured yet.
            </div>
          </aside>

          <main className="p-6">
            <div className="rounded border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-base font-semibold">Workspace</h2>
              <p className="mt-2 text-sm text-slate-400">
                Foundation scaffold is ready. Secure IPC, persistence, and MCP session features are
                next.
              </p>
              <p className="mt-3 text-xs text-slate-500">{metaText}</p>
            </div>
          </main>
        </div>

        <section className="border-t border-slate-800 bg-slate-950/80 p-4">
          <h3 className="text-sm font-medium text-slate-300">Protocol Inspector</h3>
          <p className="mt-2 text-sm text-slate-500">No session traffic yet.</p>
        </section>
      </div>
    </div>
  )
}

export default App
