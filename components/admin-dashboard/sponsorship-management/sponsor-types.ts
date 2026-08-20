export type Sponsor = {
  id: string
  imageUrl: string | null
  name: string
  description: string | null
  websiteUrl: string | null
  startsAt: string
  endsAt: string
  active: boolean
  sortOrder: number
}

export type SponsorInput = Omit<Sponsor, 'id' | 'imageUrl'> & { file?: File }
