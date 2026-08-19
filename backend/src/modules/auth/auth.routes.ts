import type { CookieOptions } from 'express'
import { Router } from 'express'
import { env } from '../../config/env.js'
import { authRateLimiter, passwordResetRateLimiter } from '../../shared/middleware/rate-limiter.js'
import { requireTrustedOrigin } from '../../shared/middleware/origin-check.js'
import { validateBody } from '../../shared/middleware/validate.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { sendSuccess } from '../../shared/utils/api-response.js'
import { authenticate } from './auth.middleware.js'
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from './auth.validation.js'
import type { LoginInput, RegisterInput, ResetPasswordInput } from './auth.validation.js'
import { getMe, login, refresh, register, requestPasswordReset, resetPassword } from './auth.service.js'
import { refreshTokenMaxAge, revokeRefreshToken } from './token.service.js'

export const authRouter = Router()

function cookieOptions(): CookieOptions {
  const options: CookieOptions = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/',
    maxAge: refreshTokenMaxAge(),
  }
  if (env.COOKIE_DOMAIN) options.domain = env.COOKIE_DOMAIN
  return options
}

function setRefreshCookie(response: Parameters<typeof sendSuccess>[0], token: string) {
  response.cookie(env.REFRESH_COOKIE_NAME, token, cookieOptions())
}

authRouter.post('/register', authRateLimiter, validateBody(registerSchema), async (request, response) => {
  const result = await register(request.validatedBody as RegisterInput)
  setRefreshCookie(response, result.refreshToken)
  sendSuccess(response, { user: result.user, accessToken: result.accessToken }, 'Account created', 201)
})

authRouter.post('/login', authRateLimiter, validateBody(loginSchema), async (request, response) => {
  const result = await login(request.validatedBody as LoginInput)
  setRefreshCookie(response, result.refreshToken)
  sendSuccess(response, { user: result.user, accessToken: result.accessToken }, 'Signed in')
})

authRouter.post('/refresh', authRateLimiter, requireTrustedOrigin, async (request, response) => {
  const rawToken = request.cookies[env.REFRESH_COOKIE_NAME] as string | undefined
  if (!rawToken) throw new ApiError(401, 'REFRESH_TOKEN_REQUIRED', 'Refresh token is required')
  const result = await refresh(rawToken)
  setRefreshCookie(response, result.refreshToken)
  sendSuccess(response, { accessToken: result.accessToken })
})

authRouter.post('/logout', requireTrustedOrigin, async (request, response) => {
  const rawToken = request.cookies[env.REFRESH_COOKIE_NAME] as string | undefined
  if (rawToken) await revokeRefreshToken(rawToken)
  const options = cookieOptions()
  delete options.maxAge
  response.clearCookie(env.REFRESH_COOKIE_NAME, options)
  sendSuccess(response, { loggedOut: true })
})

authRouter.post('/forgot-password', passwordResetRateLimiter, validateBody(forgotPasswordSchema), async (request, response) => {
  const body = request.validatedBody as { email: string }
  await requestPasswordReset(body.email)
  sendSuccess(response, { accepted: true }, 'If that account exists, a reset email will be sent')
})

authRouter.post('/reset-password', passwordResetRateLimiter, validateBody(resetPasswordSchema), async (request, response) => {
  await resetPassword(request.validatedBody as ResetPasswordInput)
  sendSuccess(response, { reset: true }, 'Password reset successfully')
})

authRouter.get('/me', authenticate, async (request, response) => {
  sendSuccess(response, await getMe(request.user!.userId))
})
