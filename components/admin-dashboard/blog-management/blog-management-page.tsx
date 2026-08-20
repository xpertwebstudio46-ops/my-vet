'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'
import { discardUpload, uploadImage } from '@/lib/api/uploads'
import { AdminIconButton } from '../shared/admin-icon-button'
import { AdminPageBanner } from '../shared/admin-page-banner'
import { StatusPill } from '../shared/status-pill'
import { BlogDeleteModal } from './blog-delete-modal'
import { BlogFormModal } from './blog-form-modal'
import type { BlogPost, BlogPostInput } from './blog-types'

export function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [deleting, setDeleting] = useState<BlogPost | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { void apiClient<BlogPost[]>('/api/admin/blog').then(setPosts).catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Blog posts could not be loaded.')) }, [])

  async function savePost(input: BlogPostInput) {
    const asset = input.file ? await uploadImage(input.file, 'BLOG') : null
    try {
      const post = await apiClient<BlogPost>(editing ? `/api/admin/blog/${editing.id}` : '/api/admin/blog', { method: editing ? 'PUT' : 'POST', body: JSON.stringify({ title: input.title, excerpt: input.excerpt, content: input.content, status: input.status, ...(asset ? { coverAssetId: asset.id } : {}) }) })
      setPosts((current) => editing ? current.map((value) => value.id === post.id ? post : value) : [post, ...current])
    } catch (caught) { if (asset) await discardUpload(asset); throw caught }
    setEditing(null); setAddOpen(false)
  }

  async function deletePost(post: BlogPost) { try { await apiClient(`/api/admin/blog/${post.id}`, { method: 'DELETE' }); setPosts((current) => current.filter((item) => item.id !== post.id)) } catch (caught) { setError(caught instanceof ApiClientError ? caught.message : 'Blog post could not be deleted.') } finally { setDeleting(null) } }

  return (
    <div className="space-y-6">
      <AdminPageBanner title="Blog Management" description="Manage posts and their R2-hosted cover images." action={{ label: 'Add Post', icon: 'plus', tone: 'blue', onClick: () => setAddOpen(true) }} />
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="border-b text-xs font-semibold uppercase text-muted-foreground"><tr><th className="px-5 py-4">Cover</th><th className="px-5 py-4">Blog</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Published</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody>{posts.map((post) => <tr key={post.id} className="border-b border-gray-200/80"><td className="px-5 py-4"><span className="relative block h-12 w-20 overflow-hidden rounded-md bg-slate-100"><Image src={post.coverUrl || '/placeholder.svg'} alt="" fill sizes="80px" className="object-cover" /></span></td><td className="px-5 py-4"><p className="text-sm font-semibold text-black">{post.title}</p><p className="mt-1 max-w-xl text-xs text-muted-foreground">{post.excerpt}</p></td><td className="px-5 py-4"><StatusPill status={post.status} /></td><td className="px-5 py-4 text-sm text-muted-foreground">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-GB') : 'Not published'}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><AdminIconButton label="Edit blog" onClick={() => setEditing(post)}><Pencil className="size-4" /></AdminIconButton><AdminIconButton label="Delete blog" onClick={() => setDeleting(post)}><Trash2 className="size-4" /></AdminIconButton></div></td></tr>)}</tbody></table></div></Card>
      {addOpen && <BlogFormModal onClose={() => setAddOpen(false)} onSave={savePost} />}
      {editing && <BlogFormModal post={editing} onClose={() => setEditing(null)} onSave={savePost} />}
      {deleting && <BlogDeleteModal post={deleting} onClose={() => setDeleting(null)} onConfirm={() => void deletePost(deleting)} />}
    </div>
  )
}
