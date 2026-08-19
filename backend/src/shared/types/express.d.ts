import type { Role } from '../../generated/prisma/enums.js'

declare global {
  namespace Express {
    interface Request {
      requestId: string
      user?: {
        userId: string
        role: Role
      }
      validatedBody?: unknown
      validatedQuery?: unknown
      validatedParams?: unknown
    }
  }
}

export {}
