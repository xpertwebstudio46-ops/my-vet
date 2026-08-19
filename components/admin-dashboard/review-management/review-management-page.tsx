'use client'

import { useMemo, useState } from 'react'
import { Card } from '@/components/dashboard/ui'
import { AdminPageBanner } from '../shared/admin-page-banner'
import { ConfirmDeleteModal } from '../shared/confirm-delete-modal'
import {
  ReviewCard,
  type ReviewManagementItem,
  type ReviewStatus,
} from './review-card'
import { ReviewTabs, type ReviewTab } from './review-tabs'

const initialReviews: ReviewManagementItem[] = [
  {
    id: 'review-1',
    reviewer: 'Ava Thompson',
    image: '/images/person-1.png',
    practice: 'Green Paws Veterinary',
    rating: 4.8,
    date: 'Aug 18, 2026',
    status: 'Pending',
    body: 'The visit was helpful and the clinic team explained the vaccination plan clearly.',
  },
  {
    id: 'review-2',
    reviewer: 'Noah Williams',
    image: '/images/person-2.png',
    practice: 'CityVet Wellness Clinic',
    rating: 4.2,
    date: 'Aug 17, 2026',
    status: 'Reported',
    body: 'This review was reported because the billing details need admin moderation.',
  },
  {
    id: 'review-3',
    reviewer: 'Sophia Martinez',
    image: '/images/person-3.png',
    practice: 'Northside Animal Care',
    rating: 5,
    date: 'Aug 15, 2026',
    status: 'Published',
    body: 'Excellent appointment experience with fast booking and clear follow-up notes.',
  },
  {
    id: 'review-4',
    reviewer: 'Liam Johnson',
    image: '/images/person-4.png',
    practice: 'Happy Tails Vet Center',
    rating: 4.5,
    date: 'Aug 13, 2026',
    status: 'Pending',
    body: 'The clinic handled a same-day appointment and provided practical aftercare advice.',
  },
]

export function ReviewManagementPage() {
  const [activeTab, setActiveTab] = useState<ReviewTab>('All')
  const [reviews, setReviews] = useState(initialReviews)
  const [deletingReview, setDeletingReview] =
    useState<ReviewManagementItem | null>(null)

  const counts = useMemo<Record<ReviewTab, number>>(() => {
    const statusCounts = reviews.reduce(
      (current, review) => {
        current[review.status] += 1
        return current
      },
      { Pending: 0, Reported: 0, Published: 0 } as Record<ReviewStatus, number>,
    )

    return {
      All: reviews.length,
      Pending: statusCounts.Pending,
      Reported: statusCounts.Reported,
      Published: statusCounts.Published,
    }
  }, [reviews])

  const visibleReviews =
    activeTab === 'All'
      ? reviews
      : reviews.filter((review) => review.status === activeTab)

  return (
    <div className="space-y-6">
      <AdminPageBanner
        title="Reviews Management"
        description="Moderate pending, reported and published reviews from one place."
      />

      <Card className="overflow-hidden p-0">
        <ReviewTabs active={activeTab} counts={counts} onChange={setActiveTab} />
        <div>
          {visibleReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onApprove={() =>
                setReviews((current) =>
                  current.map((item) =>
                    item.id === review.id
                      ? { ...item, status: 'Published' }
                      : item,
                  ),
                )
              }
              onRemove={() => setDeletingReview(review)}
            />
          ))}
        </div>
      </Card>

      {deletingReview && (
        <ConfirmDeleteModal
          title="Remove review?"
          description={`This will remove the review by ${deletingReview.reviewer}.`}
          confirmLabel="Remove"
          onClose={() => setDeletingReview(null)}
          onConfirm={() => {
            setReviews((current) =>
              current.filter((item) => item.id !== deletingReview.id),
            )
            setDeletingReview(null)
          }}
        />
      )}
    </div>
  )
}
