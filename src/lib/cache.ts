import { unstable_cache } from "next/cache"
import { prisma } from "./prisma"

export const getCachedSiteSettings = unstable_cache(
  async () => {
    return await prisma.siteSettings.findUnique({ where: { id: 1 } })
  },
  ['site-settings'],
  { tags: ['settings'], revalidate: 60 } // Revalidate every 60 seconds
)

export const getCachedCategories = unstable_cache(
  async () => {
    return await prisma.category.findMany({
      orderBy: { orderIndex: 'asc' },
      select: { name: true, slug: true, hoverImageUrl: true }
    })
  },
  ['categories'],
  { tags: ['categories'], revalidate: 60 } // Revalidate every 60 seconds
)
export const getCachedPosts = async (currentPage: number, PAGE_SIZE: number) => {
  return unstable_cache(
    async () => {
      const totalPosts = await prisma.post.count({ where: { status: "ACTIVE" } })
      const latestPosts = await prisma.post.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          author: true,
          category: true,
          media: true
        }
      })
      return { totalPosts, latestPosts }
    },
    ['latest-posts', currentPage.toString()],
    { tags: ['posts'], revalidate: 15 } // 15 seconds to keep it fresh but not kill DB
  )()
}
export const getCachedPost = async (displayId: string) => {
  return unstable_cache(
    async () => {
      return await prisma.post.findUnique({
        where: { displayId },
        include: {
          author: true,
          category: true,
          media: true,
          _count: { select: { likes: true } },
          poll: { include: { options: true } },
          comments: {
            include: { 
              author: true,
              votes: true // Fetching votes for score computation
            },
            orderBy: { createdAt: "desc" }
          }
        }
      })
    },
    ['post', displayId],
    { tags: ['post', displayId], revalidate: 30 } // Cache for 30s
  )()
}

export const getCachedCategoryPosts = async (slug: string, currentPage: number, PAGE_SIZE: number) => {
  return unstable_cache(
    async () => {
      const category = await prisma.category.findUnique({
        where: { slug }
      })
      if (!category) return null;

      const totalPosts = await prisma.post.count({ where: { categoryId: category.id, status: "ACTIVE" } })
      const posts = await prisma.post.findMany({
        where: { categoryId: category.id, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          author: true,
          category: true,
          media: true
        }
      })
      return { category, totalPosts, posts }
    },
    ['category-posts', slug, currentPage.toString()],
    { tags: ['category', slug], revalidate: 30 }
  )()
}
