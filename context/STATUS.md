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

## In Progress

**M8 — Protocol Inspector** (parallel with M7)

- [x] Message Zustand store with bounded buffer (300 messages in memory, full in DB)
- [x] Batched IPC push: main→renderer (flush every 100ms or 50 messages)
- [x] `SessionManager.onMessage()` listener + `insertSessionMessage` returns row ID
- [x] Preload `subscribeSessionMessages` bridge with cleanup
- [x] Session store ingests live stream, deduplicates, caps at 100 active messages
- [x] Manual virtualized rendering in inspector (spacer-based windowing)
- [x] Message detail panel with formatted JSON, direction, method, timestamp
- [x] Filters: direction, method, text search
- [x] Clear/pause, copy-to-clipboard
- [ ] Verify with live MCP server (manual smoke test)

**Status:** Feature-complete pending smoke test verification. All type diagnostics clean.

## What's Next

**M9 — Session History & Timings** (after M8 smoke test passes)

- Session history UI grouped by server
- Historical message loading from DB
- Latency measurement on tool invocations
- Stats per session

## Known Issues / Gaps

- `@tanstack/react-virtual` listed in M8 spec but not installed; manual windowing used instead (works, lighter dependency)
- `tests/discovery-store.test.ts` had 4 reported problems in a prior session — diagnostics now show clean, but runtime test confirmation was blocked by terminal output issues
- The 1s polling loop in App.tsx (`refreshActiveSessionMessages`) is still active alongside the new push stream — redundant but harmless; can be removed once push stream is verified via smoke test

## Project Structure

src/
├── main/ # Electron main process
│ ├── index.ts # App entry, IPC handler registration, stream batching
│ ├── mcp/
│ │ ├── session-manager.ts # Session lifecycle, discovery, message emit
│ │ └── transports/ # stdio + SSE transport factories
│ └── persistence/
│ ├── database.ts # SQLite connection (WAL, FK)
│ ├── serverProfilesRepo.ts
│ └── sessionsRepo.ts # Sessions + messages repo
├── preload/
│ └── index.ts # contextBridge, typed AppApi, stream subscription
├── renderer/src/
│ ├── App.tsx # Root wiring, effects, keyboard shortcuts
│ ├── components/
│ │ ├── discovery/ # DiscoveryPanel (tabbed tools/resources/prompts)
│ │ ├── forms/ # SchemaForm (JSON Schema → inputs)
│ │ ├── inspector/ # ProtocolInspector (virtualized message list)
│ │ ├── layout/ # AppShell, StatusBar
│ │ ├── results/ # ResultRenderer (JSON tree/raw)
│ │ ├── sidebar/ # ServerSidebar (profiles, connect)
│ │ └── workspace/ # WorkspacePanel (session status)
│ └── stores/ # Zustand: server, session, discovery, message, UI
├── shared/
│ ├── ipc.ts # IPC channel map, all types, AppApi contract
│ ├── constants.ts
│ └── errors.ts
tests/ # Vitest unit tests (12 test files)
