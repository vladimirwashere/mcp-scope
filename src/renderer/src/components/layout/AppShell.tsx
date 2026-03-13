import { useEffect, useState, type ReactNode } from 'react'

type AppShellProps = {
  sidebar: ReactNode
  main: ReactNode
  inspector: ReactNode
  statusBar: ReactNode
  inspectorHeight: number
  onInspectorHeightChange: (height: number) => void
}

function AppShell({
  sidebar,
  main,
  inspector,
  statusBar,
  inspectorHeight,
  onInspectorHeightChange
}: AppShellProps): React.JSX.Element {
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    if (!isResizing) {
      return
    }

    const handleMouseMove = (event: MouseEvent): void => {
      const maxHeight = Math.max(240, window.innerHeight - 180)
      const nextHeight = window.innerHeight - event.clientY
      const clamped = Math.max(160, Math.min(maxHeight, nextHeight))
      onInspectorHeightChange(clamped)
    }

    const handleMouseUp = (): void => {
      setIsResizing(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, onInspectorHeightChange])

  return (
    <div className="h-screen bg-slate-950 text-slate-100">
      <div
        className="grid h-full"
        style={{
          gridTemplateRows: `minmax(0, 1fr) 8px ${inspectorHeight}px auto`
        }}
      >
        <div className="grid min-h-0 grid-cols-[300px_1fr]">
          <aside className="border-r border-slate-800 bg-slate-900/70 p-4">{sidebar}</aside>
          <main className="p-6">{main}</main>
        </div>
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize inspector panel"
          className={`border-y border-slate-800 bg-slate-900/60 ${
            isResizing ? 'cursor-row-resize' : 'cursor-ns-resize'
          }`}
          onMouseDown={(event) => {
            event.preventDefault()
            setIsResizing(true)
          }}
        />
        <section className="border-t border-slate-800 bg-slate-950/80 p-4">{inspector}</section>
        <footer>{statusBar}</footer>
      </div>
    </div>
  )
}

export default AppShell
