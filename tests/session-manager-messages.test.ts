import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  return {
    countSessionMessages: vi.fn(() => 0),
    listSessionSummaries: vi.fn(),
    listSessionMessages: vi.fn(),
    getSessionRecord: vi.fn(),
    insertSessionMessage: vi.fn(),
    insertSessionRecord: vi.fn(),
    updateSessionRecord: vi.fn(),
    createTracedStdioTransport: vi.fn()
  }
})

vi.mock('../src/main/persistence/sessionsRepo', () => ({
  countSessionMessages: mocks.countSessionMessages,
  listSessionSummaries: mocks.listSessionSummaries,
  listSessionMessages: mocks.listSessionMessages,
  getSessionRecord: mocks.getSessionRecord,
  insertSessionMessage: mocks.insertSessionMessage,
  insertSessionRecord: mocks.insertSessionRecord,
  updateSessionRecord: mocks.updateSessionRecord
}))

vi.mock('../src/main/mcp/transports/stdio-transport', () => ({
  createTracedStdioTransport: mocks.createTracedStdioTransport
}))

import { SessionManager } from '../src/main/mcp/session-manager'
import { AppError } from '../src/shared/errors'

describe('SessionManager getMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns messages for persisted sessions', () => {
    mocks.getSessionRecord.mockReturnValue({
      id: 'session-1',
      transportType: 'stdio',
      command: 'node',
      args: [],
      cwd: '/tmp',
      env: {},
      status: 'disconnected',
      errorText: null,
      connectedAt: '2025-01-01T00:00:00.000Z',
      disconnectedAt: null
    })

    const expected = [
      {
        id: 7,
        sessionId: 'session-1',
        direction: 'inbound' as const,
        payload: { ok: true },
        createdAt: '2025-01-01T00:00:01.000Z'
      }
    ]
    mocks.listSessionMessages.mockReturnValue(expected)

    const manager = new SessionManager()
    const messages = manager.getMessages('session-1', 50)

    expect(messages).toEqual(expected)
    expect(mocks.getSessionRecord).toHaveBeenCalledWith('session-1')
    expect(mocks.listSessionMessages).toHaveBeenCalledWith('session-1', 50)
  })

  it('throws SESSION_NOT_FOUND when session does not exist', () => {
    mocks.getSessionRecord.mockReturnValue(null)

    const manager = new SessionManager()

    expect(() => manager.getMessages('missing', 10)).toThrowError(AppError)
    try {
      manager.getMessages('missing', 10)
      throw new Error('Expected getMessages to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe('SESSION_NOT_FOUND')
    }
    expect(mocks.listSessionMessages).not.toHaveBeenCalled()
  })
})

describe('SessionManager listSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps repository summaries into shared session summary shape', () => {
    mocks.listSessionSummaries.mockReturnValue([
      {
        sessionId: 'session-1',
        transport: 'stdio',
        state: 'ready',
        error: null,
        connectedAt: '2025-01-01T00:00:00.000Z',
        disconnectedAt: null,
        messageCount: 4
      },
      {
        sessionId: 'session-2',
        transport: 'stdio',
        state: 'error',
        error: 'boom',
        connectedAt: '2025-01-01T00:00:00.000Z',
        disconnectedAt: '2025-01-01T00:00:10.000Z',
        messageCount: 2
      }
    ])

    const manager = new SessionManager()
    const sessions = manager.listSessions(10)

    expect(mocks.listSessionSummaries).toHaveBeenCalledWith(10)
    expect(sessions).toEqual([
      {
        sessionId: 'session-1',
        state: 'ready',
        transport: 'stdio',
        connectedAt: '2025-01-01T00:00:00.000Z',
        messageCount: 4
      },
      {
        sessionId: 'session-2',
        state: 'error',
        transport: 'stdio',
        connectedAt: '2025-01-01T00:00:00.000Z',
        disconnectedAt: '2025-01-01T00:00:10.000Z',
        error: 'boom',
        messageCount: 2
      }
    ])
  })
})
