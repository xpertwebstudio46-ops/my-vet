import { describe, expect, it } from 'vitest'

describe('backend tooling', () => {
  it('runs TypeScript unit tests', () => {
    expect({ runtime: 'node', api: 'my-vet' }).toEqual({ runtime: 'node', api: 'my-vet' })
  })
})
