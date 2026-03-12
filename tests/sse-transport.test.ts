import { describe, expect, it } from 'vitest'

import { AppError } from '../src/shared/errors'
import { normalizeAndValidateSseInput } from '../src/main/mcp/transports/sse-transport'

describe('sse transport input normalization', () => {
  it('accepts http/https URLs and trims header values', () => {
    const normalized = normalizeAndValidateSseInput({
      url: ' https://example.com/mcp/sse ',
      headers: {
        Authorization: '  Bearer token  '
      }
    })

    expect(normalized.url).toBe('https://example.com/mcp/sse')
    expect(normalized.headers).toEqual({ Authorization: 'Bearer token' })
  })

  it('rejects invalid URLs', () => {
    expect(() =>
      normalizeAndValidateSseInput({
        url: 'not-a-url'
      })
    ).toThrowError(AppError)
  })

  it('rejects non-http(s) protocols', () => {
    expect(() =>
      normalizeAndValidateSseInput({
        url: 'file:///tmp/mcp-sse'
      })
    ).toThrowError(AppError)
  })
})
