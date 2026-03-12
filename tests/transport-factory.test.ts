import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createTracedStdioTransport: vi.fn(() => ({ kind: 'stdio-transport' })),
  createTracedSseTransport: vi.fn(() => ({ kind: 'sse-transport' }))
}))

vi.mock('../src/main/mcp/transports/stdio-transport', () => ({
  createTracedStdioTransport: mocks.createTracedStdioTransport
}))

vi.mock('../src/main/mcp/transports/sse-transport', () => ({
  createTracedSseTransport: mocks.createTracedSseTransport
}))

import { createTracedTransport } from '../src/main/mcp/transports/transport-factory'

describe('transport factory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates stdio transport when stdio input is provided', () => {
    const onTrace = vi.fn()

    const transport = createTracedTransport(
      {
        transport: 'stdio',
        stdio: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-memory']
        }
      },
      onTrace
    )

    expect(transport).toEqual({ kind: 'stdio-transport' })
    expect(mocks.createTracedStdioTransport).toHaveBeenCalledTimes(1)
    expect(mocks.createTracedSseTransport).not.toHaveBeenCalled()
  })

  it('creates sse transport when sse input is provided', () => {
    const onTrace = vi.fn()

    const transport = createTracedTransport(
      {
        transport: 'sse',
        sse: {
          url: 'https://example.com/mcp/sse'
        }
      },
      onTrace
    )

    expect(transport).toEqual({ kind: 'sse-transport' })
    expect(mocks.createTracedSseTransport).toHaveBeenCalledTimes(1)
    expect(mocks.createTracedStdioTransport).not.toHaveBeenCalled()
  })
})
