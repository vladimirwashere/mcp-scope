import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js'
import type { SessionConnectInput } from '../../../shared/ipc'
import { AppError } from '../../../shared/errors'
import { createTracedSseTransport, type MessageTraceHandler } from './sse-transport'
import { createTracedStdioTransport } from './stdio-transport'

export function createTracedTransport(
  input: SessionConnectInput,
  onTrace: MessageTraceHandler
): Transport {
  switch (input.transport) {
    case 'stdio':
      return createTracedStdioTransport(input.stdio, onTrace)
    case 'sse':
      return createTracedSseTransport(input.sse, onTrace)
    default:
      throw new AppError('INVALID_INPUT', 'Unsupported transport type')
  }
}
