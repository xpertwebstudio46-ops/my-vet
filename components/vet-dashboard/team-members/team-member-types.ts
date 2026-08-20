export type TeamMember = {
  id: string
  imageUrl: string | null
  name: string
  role: string
  bio: string
  qualifications: string | null
  active: boolean
  sortOrder: number
}

export type TeamMemberInput = Omit<TeamMember, 'id' | 'imageUrl'> & { file?: File }
