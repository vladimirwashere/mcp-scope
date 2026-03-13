type WorkspacePanelProps = {
  metaText: string
}

function WorkspacePanel({ metaText }: WorkspacePanelProps): React.JSX.Element {
  return (
    <div className="rounded border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-base font-semibold">Workspace</h2>
      <p className="mt-2 text-sm text-slate-400">
        Foundation scaffold is ready. Secure IPC, persistence, and MCP session features are next.
      </p>
      <p className="mt-3 text-xs text-slate-500">{metaText}</p>
    </div>
  )
}

export default WorkspacePanel
