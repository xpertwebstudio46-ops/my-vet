import type { NextFunction, Request, Response } from 'express'
import type { Role } from '../../generated/prisma/enums.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { getCurrentAuthUser } from './user-auth-cache.js'
import { verifyAccessToken } from './token.service.js'

export async function authenticate(request: Request, _response: Response, next: NextFunction) {
  try {
    const authorization = request.get('authorization')
    if (!authorization?.startsWith('Bearer ')) {
      throw new ApiError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required')
    }
    const payload = verifyAccessToken(authorization.slice(7))
    const currentUser = await getCurrentAuthUser(payload.sub)
    if (!currentUser || currentUser.role !== payload.role) {
      throw new ApiError(401, 'SESSION_INVALID', 'Session is no longer valid')
    }
    request.user = { userId: currentUser.id, role: currentUser.role }
    next()
  } catch (error) {
    if (error instanceof ApiError) next(error)
    else next(new ApiError(401, 'INVALID_ACCESS_TOKEN', 'Access token is invalid or expired'))
  }
}

export function requireRole(...roles: Role[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user || !roles.includes(request.user.role)) {
      next(new ApiError(403, 'FORBIDDEN', 'You do not have permission to perform this action'))
      return
    }
    next()
  }
}
