# MCP Scope — Current Status

**Last updated:** 2026-03-14

## Completed Milestones

| Milestone | Summary |
| ----------- | --------- |
| M1 | Scaffold, electron-vite, ESLint/Prettier/Vitest/Tailwind configured |
| M2 | Hardened BrowserWindow, typed IPC contracts, Zod validation, contextBridge, ping/pong |
| M3 | SQLite (WAL, FK), server_profiles/sessions/messages schema, repo layer, CRUD IPC |
| M4 | Stdio session manager, lifecycle state machine, message capture + persistence |
| M5 | SSE transport, unified transport factory, URL + header validation, tests |
| M6 | Dark-mode shell, resizable layout, component split, Zustand stores, status bar, shortcuts |
| M7 | Discovery IPC handlers, tabbed discovery panel, SchemaForm, invocation flow, result renderer |
| M8 | Protocol Inspector push stream validated with live MCP server; idle discovery loop fixed |
| M9 | Session history grouped by profile, persisted history inspection, invocation latency capture, session stats surfaced in UI |

## In Progress

**M10 — Error UX, Polish & Architecture Review**

- [ ] Error-path UX audit across main/preload/renderer boundaries
- [ ] Toast/notification system for transient user-facing failures
- [ ] React error boundaries around major UI sections
- [ ] App menu and final docs pass (`docs/architecture.md`, `docs/development.md`)

**Status:** M9 is complete and validated with tests. M10 has not started.

## Completed This Session

- Extended session/message IPC contracts for M9 stats fields (`errorCount`, `avgLatencyMs`, `durationMs`) and optional profile linkage.
- Added SQLite schema backfills for `sessions.server_profile_id`, `messages.latency_ms`, and `messages.is_error`.
- Updated session persistence queries to expose grouped profile metadata and per-session aggregates.
- Implemented latency timing in session manager and discovery operations; response messages now carry latency/error metadata when applicable.
- Wired profile-aware session connection input from renderer (`profileId`) to persistence.
- Added grouped session history UI in inspector with per-session stats (messages, errors, avg latency, duration).
- Added latency badges in result rendering and protocol message details.
- Updated tests for repository/session/discovery changes; verified `pnpm test --run` passes.
- Updated `.github/copilot-instructions.md` to require `pnpm lint`, `pnpm typecheck`, `pnpm test --run`, and additional impacted checks (such as `pnpm build`) after every change/patch.

## Known Issues / Gaps

- Manual windowing is used instead of `@tanstack/react-virtual` (intentional for M8).
- Polling fallback for message refresh still exists alongside push stream; remove during M10 cleanup.
