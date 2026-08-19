'use client'

import { useState } from 'react'
import { Modal } from '@/components/dashboard/modal'
import type { BlogPost, BlogStatus, BlogTab } from './blog-types'

type BlogFormModalProps = {
  activeTab: BlogTab
  post?: BlogPost | null
  onClose: () => void
  onSave: (post: BlogPost) => void
}

export function BlogFormModal({
  activeTab,
  post,
  onClose,
  onSave,
}: BlogFormModalProps) {
  const [title, setTitle] = useState(post?.title ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [category, setCategory] = useState(post?.category ?? '')
  const [money, setMoney] = useState(post?.money ?? '')
  const [views, setViews] = useState(post?.views ?? '')
  const [comments, setComments] = useState(String(post?.comments ?? 0))
  const [status, setStatus] = useState<BlogStatus>(post?.status ?? 'Draft')

  function handleSave() {
    if (!title.trim()) return

    onSave({
      id: post?.id ?? `blog-${Date.now()}`,
      tab: post?.tab ?? activeTab,
      title: title.trim(),
      excerpt: excerpt.trim() || 'Short blog summary for dashboard preview.',
      category: category.trim() || 'Small pets',
      money: money.trim() || '£0',
      views: views.trim() || '0',
      comments: Number(comments) || 0,
      status,
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={post ? 'Edit blog' : 'Add blog'}
      className="max-w-2xl"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <BlogInput label="Blog name" value={title} onChange={setTitle} />
        <BlogInput label="Category" value={category} onChange={setCategory} />
        <BlogInput label="Money" value={money} onChange={setMoney} />
        <BlogInput label="Views" value={views} onChange={setViews} />
        <BlogInput
          label="Comments"
          type="number"
          value={comments}
          onChange={setComments}
        />
        <label className="block text-sm font-medium text-black">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as BlogStatus)}
            className="mt-2 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
          >
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-black sm:col-span-2">
          Little paragraph
          <textarea
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            rows={3}
            className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-semibold text-[#064071] hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white hover:bg-[#019594]"
        >
          Save blog
        </button>
      </div>
    </Modal>
  )
}

function BlogInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'number'
}) {
  return (
    <label className="block text-sm font-medium text-black">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
      />
    </label>
  )
}
