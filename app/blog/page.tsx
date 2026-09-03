import Link from 'next/link'
import Footer from '@/components/Footer'
import { PublicHeroBanner } from '@/components/sharedComponents/PublicHeroBanner'
import { getBlogPosts } from '@/lib/api/server'
import { blogCategoryLabel } from '@/lib/blog-categories'

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const result = await getBlogPosts()

  return (
    <>
      <PublicHeroBanner
        title="MY VET Blog"
        description="Advice, platform news and stories from the veterinary community."
      />
      <main className="mx-auto max-w-6xl px-6 py-16">
        {result.items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((post) => (
              <article key={post.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                {post.coverUrl ? (
                  <img src={post.coverUrl} alt="" className="aspect-video w-full object-cover" />
                ) : (
                  <div className="aspect-video bg-teal-50" />
                )}
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-[#087b75]">{blogCategoryLabel(post.category)}</span>
                    <p className="text-xs text-slate-500">
                      {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(post.publishedAt))}
                    </p>
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-[#064071]">{post.title}</h2>
                  {post.excerpt ? <p className="mt-2 line-clamp-3 text-sm text-slate-600">{post.excerpt}</p> : null}
                  <Link href={`/blog/${post.slug}`} className="mt-4 inline-flex text-sm font-semibold text-[#01AEAD]">
                    Read article
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-slate-500 sm:py-16 lg:py-20">No published articles yet.</p>
        )}
      </main>
      <Footer />
    </>
  )
}
