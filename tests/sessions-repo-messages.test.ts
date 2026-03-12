import { beforeEach, describe, expect, it, vi } from 'vitest'

type MessageRow = {
  id: number
  session_id: string
  direction: 'outbound' | 'inbound'
  payload_json: string
  created_at: string
}

type SessionSummaryRow = {
  id: string
  transport_type: 'stdio'
  status: string
  error_text: string | null
  connected_at: string
  disconnected_at: string | null
  message_count: number
}

const state = vi.hoisted(() => ({
  rows: [] as MessageRow[],
  sessionRows: [] as SessionSummaryRow[]
}))

vi.mock('../src/main/persistence/database', () => ({
  getDatabase: () => ({
    prepare: () => ({
      all: (params: { sessionId?: string; limit: number }) => {
        if (params.sessionId === undefined) {
          return state.sessionRows.slice(0, params.limit)
        }

        return state.rows
          .filter((row) => row.session_id === params.sessionId)
          .sort((a, b) => b.id - a.id)
          .slice(0, params.limit)
      }
    })
  })
}))

import { listSessionMessages, listSessionSummaries } from '../src/main/persistence/sessionsRepo'

describe('sessionsRepo listSessionMessages', () => {
  beforeEach(() => {
    state.rows = []
    state.sessionRows = []
  })

  it('returns newest messages first and parses valid JSON payloads', () => {
    state.rows = [
      {
        id: 1,
        session_id: 's-1',
        direction: 'outbound',
        payload_json: '{"id":1,"method":"initialize"}',
        created_at: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 2,
        session_id: 's-1',
        direction: 'inbound',
        payload_json: '{"id":1,"result":{"ok":true}}',
        created_at: '2025-01-01T00:00:01.000Z'
      }
    ]

    const messages = listSessionMessages('s-1', 10)

    expect(messages).toHaveLength(2)
    expect(messages[0].id).toBe(2)
    expect(messages[0].direction).toBe('inbound')
    expect(messages[0].payload).toEqual({ id: 1, result: { ok: true } })
    expect(messages[1].id).toBe(1)
    expect(messages[1].direction).toBe('outbound')
    expect(messages[1].payload).toEqual({ id: 1, method: 'initialize' })
  })

  it('clamps limit to at least 1 and preserves malformed JSON payload as string', () => {
    state.rows = [
      {
        id: 1,
        session_id: 's-2',
        direction: 'outbound',
        payload_json: '{not-json',
        created_at: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 2,
        session_id: 's-2',
        direction: 'inbound',
        payload_json: '{"ok":true}',
        created_at: '2025-01-01T00:00:01.000Z'
      }
    ]

    const clamped = listSessionMessages('s-2', 0)
    expect(clamped).toHaveLength(1)
    expect(clamped[0].id).toBe(2)

    const allMessages = listSessionMessages('s-2', 100)
    expect(allMessages).toHaveLength(2)
    expect(allMessages[1].payload).toBe('{not-json')
  })

  it('returns session summaries with bounded limit and mapped fields', () => {
    state.sessionRows = [
      {
        id: 's-1',
        transport_type: 'stdio',
        status: 'ready',
        error_text: null,
        connected_at: '2025-01-01T00:00:00.000Z',
        disconnected_at: null,
        message_count: 3
      },
      {
        id: 's-2',
        transport_type: 'stdio',
        status: 'error',
        error_text: 'boom',
        connected_at: '2025-01-01T00:00:01.000Z',
        disconnected_at: '2025-01-01T00:00:02.000Z',
        message_count: 1
      }
    ]

    const summaries = listSessionSummaries(0)

    expect(summaries).toHaveLength(1)
    expect(summaries[0]).toEqual({
      sessionId: 's-1',
      transport: 'stdio',
      state: 'ready',
      error: null,
      connectedAt: '2025-01-01T00:00:00.000Z',
      disconnectedAt: null,
      messageCount: 3
    })
  })
})
