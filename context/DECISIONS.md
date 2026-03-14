# MCP Scope — Architecture & Design Decisions

Decisions are final unless a milestone requires revisiting them. Do not re-litigate.

---

## D1: electron-vite over custom Vite orchestration

**Context:** Electron + Vite can be wired manually or via frameworks (electron-forge, electron-vite).
**Decision:** Use `electron-vite` (alex8088/electron-vite). Purpose-built for Electron, handles main/preload/renderer configs natively, well-maintained.
**Status:** Settled since M1.

## D2: better-sqlite3 over sql.js

**Context:** sql.js (WASM) avoids native builds; better-sqlite3 requires native rebuild for Electron.
**Decision:** better-sqlite3. Significantly faster, synchronous API, battle-tested. Native rebuild handled by electron-builder config.
**Status:** Settled since M3.

## D3: No formal migration runner (deferred)

**Context:** Schema changes could use versioned .sql files + migration table, or simpler guards.
**Decision:** Use `addColumnIfMissing` guards for now. Proper migration runner is logged in polish backlog for M10.
**Reason:** Schema is still evolving rapidly in early milestones; migration runner adds overhead without benefit until schema stabilizes.
**Status:** Deferred to M10 polish backlog.

## D4: Strict process isolation model

**Context:** Electron allows varying degrees of renderer privilege.
**Decision:** `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`, `webviewTag: false`. Renderer communicates only via typed IPC through contextBridge. All external payloads treated as untrusted.
**Status:** Settled since M2. Non-negotiable.

## D5: Zustand over Redux/Jotai/Context

**Context:** Need lightweight state management for server, session, discovery, message, and UI stores.
**Decision:** Zustand. Minimal boilerplate, good TypeScript support, no provider wrapper needed, works well with Electron's single-window model.
**Status:** Settled since M6.

## D6: Tailwind CSS 4 (not 3)

**Context:** Project started fresh, no legacy CSS.
**Decision:** Tailwind v4 with `@tailwindcss/vite` plugin. Dark-mode-first, utility-driven.
**Status:** Settled since M1.

## D7: CSS flexbox + drag handle for resizable panels (not a layout library)

**Context:** Could use react-resizable-panels or similar.
**Decision:** Simple CSS flex + manual drag handle in AppShell. Lighter, no dependency, sufficient for sidebar + inspector split.
**Status:** Settled since M6. Keyboard resize fallback deferred to M10.

## D8: SchemaForm scoped to practical MCP types

**Context:** Full JSON Schema support is a rabbit hole (recursive schemas, oneOf, allOf, etc.).
**Decision:** SchemaForm handles flat objects with primitive fields (string, number, boolean, enum) and optional arrays. No recursive schemas or complex compositions in Phase 1.
**Status:** Settled since M7.

## D9: Manual windowing over @tanstack/react-virtual

**Context:** M8 spec mentioned @tanstack/react-virtual for message list virtualization.
**Decision:** Implemented manual spacer-based windowing (computed visible range from scroll position). Works well, avoids adding a dependency for a single list. Can upgrade to @tanstack/react-virtual if more virtualized lists are needed in Phase 2.
**Status:** Settled during M8 implementation.

## D10: Batched push stream over polling for protocol messages

**Context:** M6/early M8 used 1s polling (`setInterval` + `refreshActiveSessionMessages`) to show protocol messages.
**Decision:** Added batched IPC push from main process (flush every 100ms or 50 messages, whichever comes first). Session store subscribes via `window.api.subscribeSessionMessages()`. Polling loop is still active as a fallback but will be removed after smoke test confirms push stream works.
**Status:** Implemented in M8. Polling removal is a minor cleanup item.

## D11: Anti-polish rule

**Context:** Agent tendency to over-polish completed milestones, adding unrequested features.
**Decision:** When a milestone's spec checklist is complete, STOP. Log improvement ideas in the Polish & Refactor Backlog. Only implement backlog items if (a) user asks, or (b) they block the next milestone.
**Status:** Standing rule. Enforced every session.

## D12: Commit workflow

**Context:** User prefers structured commits with review before pushing.
**Decision:** Scoped conventional commits (feat/fix/refactor/test/chore + scope). Agent produces grouped commit plans with paste-ready shell commands. Check git log first to match existing style.
**Status:** Standing rule.

---

## Polish & Refactor Backlog

Items logged here are NOT bugs. They are improvement opportunities deferred until asked or until they block progress.

| ID | Source | Item | Impact | Effort |
| ---- | -------- | ------ | -------- | -------- |
| P1 | M3 | Replace addColumnIfMissing with versioned migration runner | M | M |
| P2 | M6 | Remove duplicate SSE URL input + button in ServerSidebar | S | S |
| P3 | M6 | SSE headers textarea placeholder → labeled hint for accessibility | S | S |
| P4 | M6 | Consolidate connectSseUrl into connectProfile (redundant paths) | S | S |
| P5 | M6 | AppShell drag handle: add keyboard resize fallback | S | S |
| P6 | M8 | Remove 1s polling loop after push stream verified | S | S |
| P7 | M8 | Add "Copy All" button to protocol inspector message detail panel | M | S |
| P8 | M8 | Add latency column to protocol inspector list view | M | M |
| P9 | M8 | Add "Export Session Messages" feature (JSON/CSV) | M | M |
| P10 | M9 | Add charts to session history (message volume over time, latency trends) | M | L |
| P11 | M10 | Implement app menu with Electron Menu API (File, Edit, View, Help) | M | M |
| P12 | M10 | Add React error boundaries around major UI sections (AppShell, DiscoveryPanel, ProtocolInspector) | M | M |
| P13 | M10 | Add toast/notification system for user feedback (success, error, info) | M | M |
| P14 | M10 | Write architecture and development documentation (README, code comments, wiki) | M | L |
| P15 | M10 | Document known limitations and Phase 2 recommendations in PLAN.md | M | S |
