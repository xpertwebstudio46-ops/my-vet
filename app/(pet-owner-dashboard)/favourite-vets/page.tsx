'use client'

import { useState } from 'react'
import { Heart, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { practices } from '@/lib/dashboard-data'
import { PageHeader, Card } from '@/components/dashboard/ui'
import { PracticeCard } from '@/components/dashboard/practice-card'
import { EmptyState } from '@/components/dashboard/feedback'

const favouriteIds = ['highland', 'citycenter', 'greenfield']

export default function FavouriteVetsPage() {
  const [query, setQuery] = useState('')

  const favourites = practices.filter(
    (p) =>
      favouriteIds.includes(p.id) &&
      (!query || p.name.toLowerCase().includes(query.toLowerCase())),
  )

  return (
    <div>
      <PageHeader
        title="My Favourite Vets"
        description="Practices you have favourited. We'll let you know if their hours or services change."
      />

      <Card className="mb-6 p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Practice name or treatment"
              className="h-11 w-full rounded-lg border border-gray-400/30 bg-white pl-9 pr-4 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <Button size="lg" className="h-11 bg-[#064071] px-6">
            <Search className="size-4" /> Search
          </Button>
        </div>
      </Card>

      {favourites.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {favourites.map((p) => (
            <PracticeCard key={p.id} practice={p} favourited />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No favourite vets yet"
          description="Tap the heart on any practice to save it here for quick access."
          action={
            <Button size="lg" onClick={() => setQuery('')}>
              Browse practices
            </Button>
          }
        />
      )}
    </div>
  )
}
