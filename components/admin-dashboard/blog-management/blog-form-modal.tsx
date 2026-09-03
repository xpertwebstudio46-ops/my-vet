'use client'

import Image from 'next/image'
import { ImagePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/dashboard/modal'
import { ApiClientError } from '@/lib/api/client'
import { blogCategories } from '@/lib/blog-categories'
import type { BlogPost, BlogPostInput, BlogStatus, BlogCategory } from './blog-types'

export function BlogFormModal({ post, onClose, onSave }: { post?: BlogPost | null; onClose: () => void; onSave: (post: BlogPostInput) => Promise<void> }) {
  const [title, setTitle] = useState(post?.title ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [category, setCategory] = useState<BlogCategory>(post?.category ?? 'DOGS')
  const [status, setStatus] = useState<BlogStatus>(post?.status ?? 'DRAFT')
  const [file, setFile] = useState<File>()
  const [preview, setPreview] = useState(post?.coverUrl ?? '/placeholder.svg')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => () => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview) }, [preview])

  async function handleSave() {
    if (!title.trim() || content.trim().length < 20) { setError('Add a title and at least 20 characters of content.'); return }
    setSaving(true); setError('')
    try { await onSave({ title: title.trim(), excerpt: excerpt.trim() || null, content: content.trim(), category, status, file }) }
    catch (caught) { setError(caught instanceof ApiClientError ? caught.message : 'Blog post could not be saved.'); setSaving(false) }
  }

  return (
    <Modal open onClose={onClose} title={post ? 'Edit blog' : 'Add blog'} className="max-w-2xl">
      <div className="grid gap-4">
        <label className="flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-gray-300 p-3 hover:border-[#01AEAD] hover:bg-[#EEF7F5]">
          <span className="relative h-20 w-32 overflow-hidden rounded-md bg-slate-100"><Image src={preview} alt="Cover preview" fill sizes="128px" unoptimized={preview.startsWith('blob:')} className="object-cover" /></span>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#064071]"><ImagePlus className="size-4 text-[#01AEAD]" />Upload cover image</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) { setFile(selected); setPreview(URL.createObjectURL(selected)) } }} />
        </label>
        <label className="block text-sm font-medium text-black">Title<input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#01AEAD]" /></label>
        <label className="block text-sm font-medium text-black">Excerpt<textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} rows={2} className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#01AEAD]" /></label>
        <label className="block text-sm font-medium text-black">Content<textarea value={content} onChange={(event) => setContent(event.target.value)} rows={8} className="mt-2 w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#01AEAD]" /></label>
        <label className="block text-sm font-medium text-black">Category<select value={category} onChange={(event) => setCategory(event.target.value as BlogCategory)} className="mt-2 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm">{blogCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label className="block text-sm font-medium text-black">Status<select value={status} onChange={(event) => setStatus(event.target.value as BlogStatus)} className="mt-2 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm"><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></select></label>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="h-10 rounded-md border border-gray-200 px-4 text-sm font-semibold text-[#064071]">Cancel</button><button type="button" onClick={() => void handleSave()} disabled={saving} className="h-10 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save blog'}</button></div>
    </Modal>
  )
}
