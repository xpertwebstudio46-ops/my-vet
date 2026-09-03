export type BlogTab = 'All Post' | 'Categories' | 'Comments'
export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type BlogCategory = 'HORSES' | 'DOGS' | 'CATS' | 'EXOTIC' | 'POULTRY'

export type BlogPost = {
  id: string
  title: string
  excerpt: string | null
  content: string
  coverUrl: string | null
  category: BlogCategory | null
  status: BlogStatus
  publishedAt: string | null
  createdAt: string
}

export type BlogPostInput = Pick<BlogPost, 'title' | 'excerpt' | 'content' | 'category' | 'status'> & { file?: File }
