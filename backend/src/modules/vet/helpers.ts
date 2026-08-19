import { prisma } from '../../config/database.js'
import { ApiError } from '../../shared/utils/api-error.js'

export async function getOwnedPractice(userId: string) {
  const practice = await prisma.practice.findUnique({ where: { ownerId: userId } })
  if (!practice) throw new ApiError(404, 'PRACTICE_NOT_FOUND', 'Create a practice before using the vet dashboard')
  return practice
}
