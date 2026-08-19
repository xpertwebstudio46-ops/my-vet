'use client'

import { useMemo, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { AdminIconButton } from '../shared/admin-icon-button'
import { AdminPageBanner } from '../shared/admin-page-banner'
import { StatusPill } from '../shared/status-pill'
import { BlogDeleteModal } from './blog-delete-modal'
import { BlogFormModal } from './blog-form-modal'
import { BlogTabs } from './blog-tabs'
import type { BlogPost, BlogTab } from './blog-types'

const initialPosts: BlogPost[] = [
  {
    id: 'blog-1',
    tab: 'All Post',
    title: 'Healthy routines for small pets',
    excerpt: 'Daily care guidance for owners managing small pet health.',
    category: 'Small pets',
    money: '£240',
    views: '4,820',
    comments: 42,
    status: 'Published',
  },
  {
    id: 'blog-2',
    tab: 'All Post',
    title: 'Exotics clinic checklist',
    excerpt: 'What owners should prepare before booking exotic care.',
    category: 'Exotics',
    money: '£180',
    views: '3,410',
    comments: 31,
    status: 'Draft',
  },
  {
    id: 'blog-3',
    tab: 'All Post',
    title: 'How vet pricing works',
    excerpt: 'A simple explanation of common veterinary service costs.',
    category: 'Money',
    money: '£390',
    views: '6,120',
    comments: 58,
    status: 'Published',
  },
  {
    id: 'blog-4',
    tab: 'All Post',
    title: 'Emergency care basics',
    excerpt: 'When a pet emergency should go straight to a practice.',
    category: 'Emergency',
    money: '£120',
    views: '2,904',
    comments: 19,
    status: 'Archived',
  },
  {
    id: 'blog-5',
    tab: 'Categories',
    title: 'Small pets category refresh',
    excerpt: 'Category copy update for rabbits, hamsters and guinea pigs.',
    category: 'Small pets',
    money: '£90',
    views: '1,420',
    comments: 12,
    status: 'Published',
  },
  {
    id: 'blog-6',
    tab: 'Categories',
    title: 'Exotics category guide',
    excerpt: 'Editorial notes for exotic care directory content.',
    category: 'Exotics',
    money: '£110',
    views: '1,880',
    comments: 14,
    status: 'Draft',
  },
  {
    id: 'blog-7',
    tab: 'Categories',
    title: 'Money category planning',
    excerpt: 'Plan content around pricing, insurance and care budgeting.',
    category: 'Money',
    money: '£160',
    views: '2,120',
    comments: 22,
    status: 'Published',
  },
  {
    id: 'blog-8',
    tab: 'Categories',
    title: 'Preventive care category',
    excerpt: 'Vaccination, dental and wellness category improvements.',
    category: 'Preventive',
    money: '£130',
    views: '1,970',
    comments: 17,
    status: 'Draft',
  },
  {
    id: 'blog-9',
    tab: 'Comments',
    title: 'Owner comment roundup',
    excerpt: 'Recent comment themes from pet owner education posts.',
    category: 'Community',
    money: '£70',
    views: '1,080',
    comments: 44,
    status: 'Published',
  },
  {
    id: 'blog-10',
    tab: 'Comments',
    title: 'Reported comment review',
    excerpt: 'Moderation notes for comments awaiting admin review.',
    category: 'Moderation',
    money: '£40',
    views: '820',
    comments: 28,
    status: 'Draft',
  },
  {
    id: 'blog-11',
    tab: 'Comments',
    title: 'Clinic reply highlights',
    excerpt: 'Published replies from practices under blog articles.',
    category: 'Replies',
    money: '£55',
    views: '950',
    comments: 36,
    status: 'Published',
  },
  {
    id: 'blog-12',
    tab: 'Comments',
    title: 'Archived comment notes',
    excerpt: 'Older discussion threads kept for admin context.',
    category: 'Archive',
    money: '£20',
    views: '410',
    comments: 9,
    status: 'Archived',
  },
]

export function BlogManagementPage() {
  const [activeTab, setActiveTab] = useState<BlogTab>('All Post')
  const [posts, setPosts] = useState(initialPosts)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [deleting, setDeleting] = useState<BlogPost | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const counts = useMemo<Record<BlogTab, number>>(
    () => ({
      'All Post': posts.filter((post) => post.tab === 'All Post').length,
      Categories: posts.filter((post) => post.tab === 'Categories').length,
      Comments: posts.filter((post) => post.tab === 'Comments').length,
    }),
    [posts],
  )

  const visiblePosts = posts.filter((post) => post.tab === activeTab)

  function savePost(post: BlogPost) {
    setPosts((current) => {
      const exists = current.some((item) => item.id === post.id)
      return exists
        ? current.map((item) => (item.id === post.id ? post : item))
        : [...current, post]
    })
    setEditing(null)
    setAddOpen(false)
  }

  return (
    <div className="space-y-6">
      <AdminPageBanner
        title="Blog Management"
        description="Manage posts, categories and comments for the content hub."
        action={{
          label: 'Add Post',
          icon: 'plus',
          tone: 'blue',
          onClick: () => setAddOpen(true),
        }}
      />

      <Card className="overflow-hidden p-0">
        <BlogTabs active={activeTab} counts={counts} onChange={setActiveTab} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="border-b text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-4">Blog</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Money</th>
                <th className="px-5 py-4">Views</th>
                <th className="px-5 py-4">Comments</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visiblePosts.map((post, index) => (
                <tr
                  key={post.id}
                  className={
                    index === visiblePosts.length - 1
                      ? ''
                      : 'border-b border-gray-200/80'
                  }
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-black">
                      {post.title}
                    </p>
                    <p className="mt-1 max-w-xl text-xs text-muted-foreground">
                      {post.excerpt}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {post.category}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-black">
                    {post.money}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-black">
                    {post.views}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-black">
                    {post.comments}
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill status={post.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <AdminIconButton
                        label="Edit blog"
                        onClick={() => setEditing(post)}
                      >
                        <Pencil className="size-4" />
                      </AdminIconButton>
                      <AdminIconButton
                        label="Delete blog"
                        onClick={() => setDeleting(post)}
                      >
                        <Trash2 className="size-4" />
                      </AdminIconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {addOpen && (
        <BlogFormModal
          activeTab={activeTab}
          onClose={() => setAddOpen(false)}
          onSave={savePost}
        />
      )}
      {editing && (
        <BlogFormModal
          activeTab={activeTab}
          post={editing}
          onClose={() => setEditing(null)}
          onSave={savePost}
        />
      )}
      {deleting && (
        <BlogDeleteModal
          post={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            setPosts((current) =>
              current.filter((item) => item.id !== deleting.id),
            )
            setDeleting(null)
          }}
        />
      )}
    </div>
  )
}
