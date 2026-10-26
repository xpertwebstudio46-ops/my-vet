import { z } from 'zod'
import type { Prisma } from '../../generated/prisma/client.js'
import { paginationSchema } from '../../shared/utils/pagination.js'

export const userQuery = paginationSchema.extend({
  q: z.string().trim().max(100).optional(),
  role: z.enum(['PET_OWNER', 'VET', 'ADMIN']).optional(),
  approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  practiceRegistration: z.literal('INCOMPLETE').optional(),
}).refine((query) => !query.practiceRegistration || query.role === 'VET', {
  path: ['practiceRegistration'],
  message: 'Incomplete practice registration is only available for veterinary accounts',
})

export function userWhere(query: z.infer<typeof userQuery>): Prisma.UserWhereInput {
  return {
    ...(query.role ? { role: query.role } : {}),
    ...(query.approvalStatus ? { approvalStatus: query.approvalStatus } : {}),
    ...(query.practiceRegistration ? { practice: { is: null } } : {}),
    ...(query.q ? { OR: [
      { email: { contains: query.q, mode: 'insensitive' } },
      { firstName: { contains: query.q, mode: 'insensitive' } },
      { lastName: { contains: query.q, mode: 'insensitive' } },
    ] } : {}),
  }
}
