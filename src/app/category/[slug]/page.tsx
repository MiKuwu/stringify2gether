export const revalidate = 300

import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import Pagination from "@/components/Pagination"
import { Suspense } from "react"
import { getCachedCategoryPosts } from "@/lib/cache"

const PAGE_SIZE = 6

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ page?: string }> }) {
  const { slug } = await params
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page || "1"))

  const data = await getCachedCategoryPosts(slug, currentPage, PAGE_SIZE)
  if (!data) notFound()
  const { category, totalPosts, posts } = data;
  const totalPages = Math.ceil(totalPosts / PAGE_SIZE)

  return (
    <div>
      {category.bannerUrl && (
        <div className="w-full h-64 md:h-80 relative overflow-hidden">
          <Image src={category.bannerUrl} alt={category.name} fill preload sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
        </div>
      )}
      <div className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-end mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-4xl font-bold uppercase tracking-wider text-teal-400">{category.name}</h1>
        <Link href={`/create?categoryId=${category.id}`} className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded font-medium">
          Đăng bài viết mới
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <Link key={post.id} href={`/post/${post.displayId}`} className="block group">
            <div className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-colors h-full flex flex-col">
              {post.media.length > 0 ? (
                <div className="h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <Image src={post.media[0].type === "VIDEO" ? post.media[0].url.replace(/\.[^/.]+$/, ".jpg") : post.media[0].url} alt={post.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  {post.media[0].type === "VIDEO" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-md">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 font-medium">
                  No image
                </div>
              )}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-teal-300 transition-colors">{post.title}</h3>
                <div className="mt-auto pt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>{post.author.username || "Người dùng ẩn danh"}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {posts.length === 0 && (
          <p className="text-slate-600 dark:text-slate-400 col-span-full">Chưa có bài viết nào trong chuyên mục này.</p>
        )}
      </div>
      <Suspense>
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </Suspense>
    </div>
    </div>
  )
}
