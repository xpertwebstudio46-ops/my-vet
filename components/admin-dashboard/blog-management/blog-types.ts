export type BlogTab = 'All Post' | 'Categories' | 'Comments'

export type BlogStatus = 'Published' | 'Draft' | 'Archived'

export type BlogPost = {
  id: string
  tab: BlogTab
  title: string
  excerpt: string
  category: string
  money: string
  views: string
  comments: number
  status: BlogStatus
}
