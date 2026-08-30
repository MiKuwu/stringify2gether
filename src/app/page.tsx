export const revalidate = 30

import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import HeroButtons from "@/components/HeroButtons"
import Pagination from "@/components/Pagination"
import { Suspense } from "react"

import { getCachedSiteSettings, getCachedPosts } from "@/lib/cache"

const PAGE_SIZE = 6

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page || "1"))

  const settings = await getCachedSiteSettings()
  
  const { totalPosts, latestPosts } = await getCachedPosts(currentPage, PAGE_SIZE)
  const totalPages = Math.ceil(totalPosts / PAGE_SIZE)


  return (
    <div>
      {/* Hero Banner */}
      <div className="min-h-[400px] py-16 w-full bg-slate-900 flex items-center justify-center relative overflow-hidden">
        {settings?.bannerImage && (
          <Image
            src={settings.bannerImage}
            alt="Hero Banner"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            quality={80}
          />
        )}
        <div className="absolute inset-0 bg-black/50 z-0"></div>
        <div className="z-10 text-center flex flex-col items-center px-4 w-full">
          {settings?.logoUrl && (
            <Image src={settings.logoUrl} alt="Logo" width={400} height={128} className="h-24 md:h-32 mb-4 object-contain max-w-full" />
          )}
          <h1 
            className="text-3xl md:text-5xl font-extrabold uppercase tracking-wider text-white drop-shadow-lg break-words w-full"
            style={settings?.homeTitleColor ? { color: settings.homeTitleColor } : {}}
          >
            {settings?.homeTitle || settings?.siteTitle || "Strinova Guide Hub"}
          </h1>
          <p 
            className="mt-4 text-base md:text-lg text-slate-200 max-w-xl break-words"
            style={settings?.siteDescColor ? { color: settings.siteDescColor } : {}}
          >
            {settings?.siteDescription || "Cộng đồng chia sẻ giáo án, line-up và kinh nghiệm chơi Strinova lớn nhất Việt Nam."}
          </p>
          <HeroButtons rulesContent={settings?.rulesContent || null} />
        </div>
      </div>

      <div className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold mb-8 uppercase border-l-4 border-teal-500 pl-4">Bài viết mới nhất</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestPosts.map(post => (
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
                  <div className="text-xs text-teal-400 font-bold mb-2 uppercase">{post.category.name}</div>
                  <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-teal-300 transition-colors">{post.title}</h3>
                  <div className="mt-auto pt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>{post.author.username || "Người dùng ẩn danh"}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {latestPosts.length === 0 && (
            <p className="text-slate-600 dark:text-slate-400 col-span-full">Chưa có bài viết nào.</p>
          )}
        </div>
        <Suspense>
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </Suspense>
      </div>
    </div>
  )
}


