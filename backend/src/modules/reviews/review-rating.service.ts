import type { Prisma } from '../../generated/prisma/client.js'

export async function recalculatePracticeRating(transaction: Prisma.TransactionClient, practiceId: string) {
  const aggregate = await transaction.review.aggregate({
    where: { practiceId, status: 'APPROVED' },
    _avg: { rating: true },
    _count: { rating: true },
  })
  return transaction.practice.update({
    where: { id: practiceId },
    data: {
      rating: aggregate._avg.rating ?? 0,
      reviewCount: aggregate._count.rating,
    },
  })
}
