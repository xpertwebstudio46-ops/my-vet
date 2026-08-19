import { describe, expect, it } from 'vitest'
import { detectImage } from './upload.service.js'

describe('upload image inspection', () => {
  it('accepts a decodable image whose magic bytes match', async () => {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    )
    await expect(detectImage(png)).resolves.toMatchObject({ mime: 'image/png' })
  })

  it('rejects text renamed as an image', async () => {
    await expect(detectImage(Buffer.from('not actually an image'))).rejects.toMatchObject({ code: 'UNSUPPORTED_IMAGE' })
  })
})
