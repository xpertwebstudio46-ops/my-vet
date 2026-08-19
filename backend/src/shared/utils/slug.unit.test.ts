import { describe, expect, it } from 'vitest'
import { toSlug } from './slug.js'

describe('toSlug', () => {
  it('normalizes punctuation and diacritics', () => {
    expect(toSlug('  Café & Veterinary Care  ')).toBe('cafe-veterinary-care')
  })
})
