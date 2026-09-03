import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import { PublicHeroBanner } from '@/components/sharedComponents/PublicHeroBanner'
import { ApiRequestError, getBlogPost } from '@/lib/api/server'
import { blogCategoryLabel } from '@/lib/blog-categories'

export const dynamic = 'force-dynamic'

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let post

  try {
    post = await getBlogPost(slug)
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) notFound()
    throw error
  }

  return (
    <>
      <PublicHeroBanner
        title={post.title}
        description={post.excerpt || 'Advice, platform news and stories from the veterinary community.'}
      />
      <main className="mx-auto max-w-3xl px-6 py-14">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-[#087b75]">{blogCategoryLabel(post.category)}</span>
          <p className="text-sm text-slate-500">
            {new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date(post.publishedAt))} &middot; {post.author.firstName} {post.author.lastName}
          </p>
        </div>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-[#064071]">{post.title}</h1>
        {post.excerpt ? <p className="mt-4 text-lg text-slate-600">{post.excerpt}</p> : null}
        {post.coverUrl ? <img src={post.coverUrl} alt="" className="mt-8 aspect-video w-full rounded-2xl object-cover" /> : null}
        <article className="mt-8 whitespace-pre-wrap text-base leading-8 text-slate-700">{post.content}</article>
      </main>
      <Footer />
    </>
  )
}
