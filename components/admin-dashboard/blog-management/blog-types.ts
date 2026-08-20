export type BlogTab = 'All Post' | 'Categories' | 'Comments'
export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export type BlogPost = {
  id: string
  title: string
  excerpt: string | null
  content: string
  coverUrl: string | null
  status: BlogStatus
  publishedAt: string | null
  createdAt: string
}

export type BlogPostInput = Pick<BlogPost, 'title' | 'excerpt' | 'content' | 'status'> & { file?: File }
