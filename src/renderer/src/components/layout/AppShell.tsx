import type { ReactNode } from 'react'

type AppShellProps = {
  sidebar: ReactNode
  main: ReactNode
  inspector: ReactNode
}

function AppShell({ sidebar, main, inspector }: AppShellProps): React.JSX.Element {
  return (
    <div className="h-screen bg-slate-950 text-slate-100">
      <div className="grid h-full grid-rows-[1fr_220px]">
        <div className="grid min-h-0 grid-cols-[300px_1fr]">
          <aside className="border-r border-slate-800 bg-slate-900/70 p-4">{sidebar}</aside>
          <main className="p-6">{main}</main>
        </div>
        <section className="border-t border-slate-800 bg-slate-950/80 p-4">{inspector}</section>
      </div>
    </div>
  )
}

export default AppShell
