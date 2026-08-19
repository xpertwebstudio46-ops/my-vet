import { describe, expect, it } from 'vitest'
import { durationToMilliseconds } from './duration.js'

describe('durationToMilliseconds', () => {
  it('parses supported JWT duration units', () => {
    expect(durationToMilliseconds('15m')).toBe(900_000)
    expect(durationToMilliseconds('30d')).toBe(2_592_000_000)
  })

  it('rejects ambiguous durations', () => {
    expect(() => durationToMilliseconds('30 days')).toThrow('Invalid duration')
  })
})
