import { S3Client } from '@aws-sdk/client-s3'
import { env } from './env.js'
import { ApiError } from '../shared/utils/api-error.js'

let r2Client: S3Client | undefined

export function getR2() {
  if (
    !env.R2_ENABLED ||
    !env.CLOUDFLARE_ACCOUNT_ID ||
    !env.CLOUDFLARE_R2_ENDPOINT ||
    !env.CLOUDFLARE_R2_ACCESS_KEY ||
    !env.CLOUDFLARE_R2_SECRET_KEY
  ) {
    throw new ApiError(503, 'UPLOADS_NOT_CONFIGURED', 'File uploads are not configured')
  }
  r2Client ??= new S3Client({
    region: 'auto',
    endpoint: env.CLOUDFLARE_R2_ENDPOINT.replace(/\/$/, ''),
    credentials: {
      accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY,
      secretAccessKey: env.CLOUDFLARE_R2_SECRET_KEY,
    },
  })
  return r2Client
}
