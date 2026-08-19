export type VetReview = {
  id: string
  reviewer: string
  image: string
  rating: number
  date: string
  message: string
}

export const ratingSummary = {
  rating: 4.8,
  total: 186,
  distribution: [
    { stars: 5, percent: 82 },
    { stars: 4, percent: 12 },
    { stars: 3, percent: 4 },
    { stars: 2, percent: 1 },
    { stars: 1, percent: 1 },
  ],
}

export const vetReviews: VetReview[] = [
  {
    id: 'review-1',
    reviewer: 'Ava Thompson',
    image: '/images/person-1.png',
    rating: 5,
    date: 'Aug 18, 2026',
    message:
      'The team was calm, kind and explained every step of Mochi’s dental check clearly.',
  },
  {
    id: 'review-2',
    reviewer: 'Noah Williams',
    image: '/images/person-2.png',
    rating: 5,
    date: 'Aug 16, 2026',
    message:
      'Bruno was nervous, but the vet handled him carefully and gave practical aftercare notes.',
  },
  {
    id: 'review-3',
    reviewer: 'Sophia Martinez',
    image: '/images/person-3.png',
    rating: 4,
    date: 'Aug 14, 2026',
    message:
      'Helpful follow-up and quick response to my rabbit care questions after the appointment.',
  },
]
