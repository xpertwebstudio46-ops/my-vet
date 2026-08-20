import type { Prisma } from '../../generated/prisma/client.js'

export async function recalculatePracticeRating(transaction: Prisma.TransactionClient, practiceId: string) {
  const [practice, aggregate] = await Promise.all([
    transaction.practice.findUniqueOrThrow({
      where: { id: practiceId },
      select: { legacyRatingTotal: true, legacyReviewCount: true },
    }),
    transaction.review.aggregate({
      where: { practiceId, status: 'APPROVED' },
      _sum: { rating: true },
      _count: { rating: true },
    }),
  ])

  const reviewCount = practice.legacyReviewCount + aggregate._count.rating
  const ratingTotal = practice.legacyRatingTotal.add(aggregate._sum.rating ?? 0)

  return transaction.practice.update({
    where: { id: practiceId },
    data: {
      rating: reviewCount === 0 ? 0 : ratingTotal.div(reviewCount),
      reviewCount,
    },
  })
}
