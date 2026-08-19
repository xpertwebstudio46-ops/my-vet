import type { LucideIcon } from 'lucide-react'

export type FeaturedStat = {
  label: string
  value: string
  icon: LucideIcon
}

export type BoostPlan = {
  id: string
  name: string
  price: string
  tag: string
  description: string
}
