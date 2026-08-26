import { describe, expect, it } from 'vitest'
import { selectFrontendOrigin } from './frontend-url.js'

describe('selectFrontendOrigin', () => {
  const allowed = ['https://test.my-vet.co.uk', 'http://localhost:3000']

  it('uses the requesting frontend when it is allow-listed', () => {
    expect(selectFrontendOrigin('http://localhost:3000', allowed)).toBe('http://localhost:3000')
  })

  it('falls back to the configured frontend for untrusted origins', () => {
    expect(selectFrontendOrigin('https://attacker.example', allowed)).toBe('https://test.my-vet.co.uk')
  })

  it('normalizes configured origins before comparing them', () => {
    expect(selectFrontendOrigin('https://test.my-vet.co.uk', ['https://test.my-vet.co.uk/'])).toBe('https://test.my-vet.co.uk')
  })
})
