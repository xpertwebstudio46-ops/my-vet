'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  animalTypes,
  practices,
  services as serviceList,
} from '@/lib/dashboard-data'
import { PageHeader, Card } from '@/components/dashboard/ui'
import { PracticeCard } from '@/components/dashboard/practice-card'
import { Pagination } from '@/components/dashboard/feedback'

const sortOptions = ['Recommended', 'Highest rated', 'Nearest', 'Most reviewed']

export default function FindAVetPage() {
  const [query, setQuery] = useState(() => {
    if (typeof window === 'undefined') return ''
    return new URLSearchParams(window.location.search).get('q') ?? ''
  })
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [sort, setSort] = useState(sortOptions[0])
  const [sortOpen, setSortOpen] = useState(false)
  const [
    filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)

  function updateSearchUrl() {
    const params = new URLSearchParams(window.location.search)
    const trimmed = query.trim()

    if (trimmed) {
      params.set('q', trimmed)
    } else {
      params.delete('q')
    }

    const search = params.toString()
    window.history.pushState(null, '', search ? `?${search}` : window.location.pathname)
  }

  function toggle(
    list: string[],
    setList: (v: string[]) => void,
    value: string,
  ) {
    setList(
      list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value],
    )
    setPage(1)
  }

  const filtered = useMemo(() => {
    let result = practices.filter((p) => {
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      const matchesAnimal =
        selectedAnimals.length === 0 ||
        selectedAnimals.some((a) => p.tags.includes(a))
      const matchesService =
        selectedServices.length === 0 ||
        selectedServices.some((s) => p.tags.includes(s))
      return matchesQuery && matchesAnimal && matchesService
    })
    if (sort === 'Highest rated')
      result = [...result].sort((a, b) => b.rating - a.rating)
    if (sort === 'Most reviewed')
      result = [...result].sort((a, b) => b.reviews - a.reviews)
    if (sort === 'Nearest')
      result = [...result].sort(
        (a, b) => parseFloat(a.distance) - parseFloat(b.distance),
      )
    return result
  }, [query, selectedAnimals, selectedServices, sort])

  const totalResults = 104
  const filterCount = selectedAnimals.length + selectedServices.length

  const filterContent = (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-[12.62px] font-normal">Animal type</p>
        <div className="space-y-2.5">
          {animalTypes.map((a) => (
            <Checkbox
              key={a}
              label={a}
              checked={selectedAnimals.includes(a)}
              onChange={() =>
                toggle(selectedAnimals, setSelectedAnimals, a)
              }
            />
          ))}
        </div>
      </div>
      <div className="border-t border-border pt-5">
        <p className="mb-3 text-[12.62px] font-normal">Services</p>
        <div className="space-y-2.5">
          {serviceList.map((s) => (
            <Checkbox
              key={s}
              label={s}
              checked={selectedServices.includes(s)}
              onChange={() =>
                toggle(selectedServices, setSelectedServices, s)
              }
            />
          ))}
        </div>
      </div>
      {filterCount > 0 && (
        <button
          type="button"
          onClick={() => {
            setSelectedAnimals([])
            setSelectedServices([])
          }}
          className="text-xs font-medium text-brand hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Find a Vet"
        description="Search the MY VET directory by location, animal type and service."
      />

      <Card className="mb-6 p-3">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            updateSearchUrl()
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Practice name or treatment"
              className="h-11 w-full rounded-lg border border-gray-400/30 bg-white pl-9 pr-4 text-sm  outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <Button size="lg" className="h-11 px-6 bg-[#064071] ">
            <Search className="size-4" /> Search
          </Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        {/* Filters — desktop */}
        <aside className="hidden lg:block">
          <Card className="sticky top-20 p-5">
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal className="size-4  text-[#064071]" />
              <h2 className="font-manrope text-md font-bold">
                Advanced Filters
              </h2>
            </div>
            {filterContent}
          </Card>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-4 flex items-center justify-between gap-3 bg-white p-3 rounded-lg">
            <p className="text-sm text-[#475569]">
              Showing{' '}
              <span className="font-semibold text-[#475569]">
                {totalResults}
              </span>{' '}
              practices
            </p>
            <div className="flex items-center gap-2 ">
              <Button
             
                size="lg"
                className="lg:hidden bg-[#E2E8F0]"
                onClick={() => setFiltersOpen((o) => !o)}
              >
                <SlidersHorizontal className="size-4" />
                Filters
                {filterCount > 0 && (
                  <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-brand text-[0.65rem] font-bold text-brand-foreground">
                    {filterCount}
                  </span>
                )}
              </Button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen((o) => !o)}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium hover:bg-muted"
                >
                  <span className="hidden sm:inline text-muted-foreground">
                    Sort by:
                  </span>
                  {sort}
                  <ChevronDown className="size-4 text-muted-foreground" />
                </button>
                {sortOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setSortOpen(false)}
                    />
                    <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-lg">
                      {sortOptions.map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => {
                            setSort(o)
                            setSortOpen(false)
                          }}
                          className={`block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted ${
                            o === sort ? 'font-semibold text-brand' : ''
                          }`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Filters — mobile collapsible */}
          {filtersOpen && (
            <Card className="mb-4 p-5 lg:hidden">{filterContent}</Card>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 ">
            {filtered.map((p) => (
              <PracticeCard key={p.id} practice={p} />
            ))}
          </div>

          <Pagination page={page} totalPages={9} onChange={setPage} />
        </div>
      </div>
    </div>
  )
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <span
        className={`flex size-4 items-center justify-center rounded border transition-colors ${
          checked
            ? 'border-brand bg-brand text-brand-foreground'
            : 'border-border bg-card'
        }`}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="size-3" fill="none">
            <path
              d="M2.5 6.5L5 9L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className="text-foreground">{label}</span>
    </label>
  )
}
