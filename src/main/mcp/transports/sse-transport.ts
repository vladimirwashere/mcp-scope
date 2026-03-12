import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
import type { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js'
import type { Transport, TransportSendOptions } from '@modelcontextprotocol/sdk/shared/transport.js'
import { z } from 'zod'
import { AppError } from '../../../shared/errors'
import type { SseConnectInput } from '../../../shared/ipc'

const headerNameSchema = z
  .string()
  .trim()
  .min(1, 'Header name is required')
  .max(256, 'Header name is too long')

const headerValueSchema = z.string().trim().max(4096, 'Header value is too long')

const sseConnectSchema = z.object({
  url: z.string().trim().url('SSE URL must be a valid URL').max(4096),
  headers: z.record(headerNameSchema, headerValueSchema).default({})
})

export type TraceDirection = 'outbound' | 'inbound'

export type MessageTraceHandler = (direction: TraceDirection, message: JSONRPCMessage) => void

export type SafeSseConfig = {
  url: string
  headers: Record<string, string>
}

export function normalizeAndValidateSseInput(input: SseConnectInput): SafeSseConfig {
  const parsed = sseConnectSchema.safeParse(input)

  if (!parsed.success) {
    throw new AppError(
      'INVALID_INPUT',
      parsed.error.issues.map((issue) => issue.message).join(', ')
    )
  }

  const url = new URL(parsed.data.url)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new AppError('INVALID_INPUT', 'SSE URL must use http or https')
  }

  return {
    url: url.toString(),
    headers: parsed.data.headers
  }
}

class TracingTransport implements Transport {
  private readonly inner: Transport
  private readonly onTrace: MessageTraceHandler

  onclose?: () => void
  onerror?: (error: Error) => void
  onmessage?: <T extends JSONRPCMessage>(message: T) => void
  sessionId?: string
  setProtocolVersion?: (version: string) => void

  constructor(inner: Transport, onTrace: MessageTraceHandler) {
    this.inner = inner
    this.onTrace = onTrace
  }

  async start(): Promise<void> {
    this.inner.onclose = () => {
      this.onclose?.()
    }

    this.inner.onerror = (error) => {
      this.onerror?.(error)
    }

    this.inner.onmessage = (message) => {
      this.onTrace('inbound', message)
      this.onmessage?.(message)
    }

    this.inner.setProtocolVersion = (version) => {
      this.setProtocolVersion?.(version)
    }

    await this.inner.start()
    if (this.inner.sessionId !== undefined) {
      this.sessionId = this.inner.sessionId
    }
  }

  async send(message: JSONRPCMessage, options?: TransportSendOptions): Promise<void> {
    this.onTrace('outbound', message)
    await this.inner.send(message, options)
  }

  async close(): Promise<void> {
    await this.inner.close()
  }
}

export function createTracedSseTransport(
  input: SseConnectInput,
  onTrace: MessageTraceHandler
): Transport {
  const validated = normalizeAndValidateSseInput(input)

  const base = new SSEClientTransport(new URL(validated.url), {
    requestInit: {
      headers: validated.headers
    }
  })

  return new TracingTransport(base, onTrace)
}
