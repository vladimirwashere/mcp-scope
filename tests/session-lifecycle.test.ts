import { describe, expect, it } from 'vitest'

import { transitionSessionState } from '../src/main/mcp/session-manager'

describe('session lifecycle transitions', () => {
  it('moves into connecting on connect start', () => {
    expect(transitionSessionState('disconnected', 'start-connect')).toBe('connecting')
  })

  it('moves into ready after initialization completes', () => {
    expect(transitionSessionState('initializing', 'connected')).toBe('ready')
  })

  it('moves into disconnecting unless already disconnected', () => {
    expect(transitionSessionState('ready', 'start-disconnect')).toBe('disconnecting')
    expect(transitionSessionState('disconnected', 'start-disconnect')).toBe('disconnected')
  })

  it('moves into error on failure from any state', () => {
    expect(transitionSessionState('connecting', 'fail')).toBe('error')
    expect(transitionSessionState('ready', 'fail')).toBe('error')
  })
})
