import 'dotenv/config'
import { z } from 'zod'

const optionalString = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().optional(),
)

const optionalUrl = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.url().optional(),
)

const envBoolean = (defaultValue: boolean) =>
  z
    .enum(['true', 'false'])
    .default(defaultValue ? 'true' : 'false')
    .transform((value) => value === 'true')

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65_535).default(5000),
    DATABASE_URL: z.string().min(1),
    DATABASE_URL_TEST: optionalString,
    TRUST_PROXY: z.string().default('1'),
    FRONTEND_URL: z.string().min(1).default('http://localhost:3000'),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRY: z.string().regex(/^\d+[smhd]$/).default('15m'),
    JWT_REFRESH_EXPIRY: z.string().regex(/^\d+[smhd]$/).default('30d'),
    JWT_ISSUER: z.string().min(1).default('my-vet-api'),
    JWT_AUDIENCE: z.string().min(1).default('my-vet-web'),
    REFRESH_COOKIE_NAME: z.string().min(1).default('myvet_refresh'),
    COOKIE_DOMAIN: optionalString,
    COOKIE_SECURE: envBoolean(false),
    COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
    MAIL_FROM: z.email().default('no-reply@example.com'),
    PASSWORD_RESET_URL: z.url().default('http://localhost:3000/reset-password'),
    STRIPE_ENABLED: envBoolean(false),
    STRIPE_SECRET_KEY: optionalString,
    STRIPE_WEBHOOK_SECRET: optionalString,
    R2_ENABLED: envBoolean(false),
    CLOUDFLARE_ACCOUNT_ID: optionalString,
    CLOUDFLARE_R2_ACCESS_KEY: optionalString,
    CLOUDFLARE_R2_SECRET_KEY: optionalString,
    CLOUDFLARE_R2_BUCKET: optionalString,
    CLOUDFLARE_CDN_URL: optionalUrl,
  })
  .superRefine((value, context) => {
    if (value.STRIPE_ENABLED) {
      for (const key of ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'] as const) {
        if (!value[key]) {
          context.addIssue({ code: 'custom', path: [key], message: `${key} is required when Stripe is enabled` })
        }
      }
    }

    if (value.R2_ENABLED) {
      for (const key of [
        'CLOUDFLARE_ACCOUNT_ID',
        'CLOUDFLARE_R2_ACCESS_KEY',
        'CLOUDFLARE_R2_SECRET_KEY',
        'CLOUDFLARE_R2_BUCKET',
        'CLOUDFLARE_CDN_URL',
      ] as const) {
        if (!value[key]) {
          context.addIssue({ code: 'custom', path: [key], message: `${key} is required when R2 is enabled` })
        }
      }
    }

    if (value.COOKIE_SAME_SITE === 'none' && !value.COOKIE_SECURE) {
      context.addIssue({
        code: 'custom',
        path: ['COOKIE_SECURE'],
        message: 'COOKIE_SECURE must be true when COOKIE_SAME_SITE is none',
      })
    }
  })

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
  throw new Error(`Invalid environment configuration: ${details}`)
}

export const env = parsed.data
export type AppEnv = z.infer<typeof envSchema>

export const frontendOrigins = env.FRONTEND_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
