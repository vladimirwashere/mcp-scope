import type { SessionMessage, SessionStatus, SessionSummary } from '../../../../shared/ipc'

type ProtocolInspectorProps = {
  sessionStatus: SessionStatus | null
  sessionMessages: SessionMessage[]
  sessionHistory: SessionSummary[]
  sessionError: string | null
  onRefreshSessions: () => void
  onRefreshMessages: () => void
  onDisconnect: () => void
  onInspectSession: (sessionId: string) => void
}

function ProtocolInspector({
  sessionStatus,
  sessionMessages,
  sessionHistory,
  sessionError,
  onRefreshSessions,
  onRefreshMessages,
  onDisconnect,
  onInspectSession
}: ProtocolInspectorProps): React.JSX.Element {
  return (
    <>
      <h3 className="text-sm font-medium text-slate-300">Protocol Inspector</h3>
      {sessionStatus ? (
        <div className="mt-2 space-y-1 text-sm text-slate-400">
          <p>Session: {sessionStatus.sessionId}</p>
          <p>State: {sessionStatus.state}</p>
          <p>Messages: {sessionStatus.messageCount}</p>
          <button
            onClick={onRefreshSessions}
            className="mt-1 rounded border border-slate-700 px-2 py-1 text-xs text-slate-300"
          >
            Refresh Sessions
          </button>
          <button
            onClick={onRefreshMessages}
            className="mt-1 rounded border border-slate-700 px-2 py-1 text-xs text-slate-300"
          >
            Refresh Messages
          </button>
          <button
            onClick={onDisconnect}
            className="mt-1 rounded border border-slate-700 px-2 py-1 text-xs text-slate-300"
          >
            Disconnect Active Session
          </button>
          <div className="mt-3 max-h-40 space-y-2 overflow-auto rounded border border-slate-800 bg-slate-950/60 p-2">
            {sessionMessages.length === 0 ? (
              <p className="text-xs text-slate-500">No captured messages yet.</p>
            ) : (
              sessionMessages.map((message) => (
                <div
                  key={message.id}
                  className="rounded border border-slate-800 bg-slate-900/50 p-2"
                >
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.08em]">
                    <span
                      className={
                        message.direction === 'outbound' ? 'text-emerald-400' : 'text-sky-400'
                      }
                    >
                      {message.direction}
                    </span>
                    <span className="text-slate-500">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="mt-2 overflow-x-auto text-xs text-slate-300">
                    {JSON.stringify(message.payload, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
          <div className="mt-3 max-h-40 space-y-2 overflow-auto rounded border border-slate-800 bg-slate-950/60 p-2">
            {sessionHistory.length === 0 ? (
              <p className="text-xs text-slate-500">No recent sessions.</p>
            ) : (
              sessionHistory.map((session) => (
                <button
                  key={session.sessionId}
                  onClick={() => onInspectSession(session.sessionId)}
                  className={`w-full rounded border p-2 text-left text-xs ${
                    sessionStatus.sessionId === session.sessionId
                      ? 'border-slate-500 bg-slate-800/70'
                      : 'border-slate-800 bg-slate-900/40'
                  }`}
                >
                  <p className="font-medium text-slate-300">{session.sessionId}</p>
                  <p className="mt-1 text-slate-500">
                    {session.state} • {session.messageCount} messages
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-500">No session traffic yet.</p>
      )}
      {sessionError ? <p className="mt-2 text-xs text-rose-400">{sessionError}</p> : null}
    </>
  )
}

export default ProtocolInspector
