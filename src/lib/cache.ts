import { unstable_cache } from "next/cache"
import type { Prisma } from "@prisma/client"
import { prisma } from "./prisma"

const postCardSelect = {
  id: true,
  displayId: true,
  title: true,
  createdAt: true,
  author: {
    select: { username: true },
  },
  category: {
    select: { name: true },
  },
  media: {
    take: 1,
    select: { url: true, type: true },
  },
} satisfies Prisma.PostSelect

export const getCachedSiteSettings = unstable_cache(
  async () => {
    return await prisma.siteSettings.findUnique({ where: { id: 1 } })
  },
  ['site-settings'],
  { tags: ['settings'], revalidate: 3600 }
)

export const getCachedCategories = unstable_cache(
  async () => {
    return await prisma.category.findMany({
      orderBy: { orderIndex: 'asc' },
      select: { name: true, slug: true, hoverImageUrl: true }
    })
  },
  ['categories'],
  { tags: ['categories'], revalidate: 3600 }
)
export const getCachedPosts = async (currentPage: number, PAGE_SIZE: number) => {
  return unstable_cache(
    async () => {
      const [totalPosts, latestPosts] = await Promise.all([
        prisma.post.count({ where: { status: "ACTIVE" } }),
        prisma.post.findMany({
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          skip: (currentPage - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          select: postCardSelect,
        }),
      ])
      return { totalPosts, latestPosts }
    },
    ['latest-posts', currentPage.toString(), PAGE_SIZE.toString()],
    { tags: ['posts'], revalidate: 300 }
  )()
}
export const getCachedPost = async (displayId: string) => {
  return unstable_cache(
    async () => {
      return await prisma.post.findUnique({
        where: { displayId },
        select: {
          id: true,
          displayId: true,
          title: true,
          content: true,
          createdAt: true,
          status: true,
          takedownMessage: true,
          watermarkText: true,
          watermarkLogo: true,
          isAiGenerated: true,
          authorId: true,
          author: {
            select: { username: true, image: true, role: true },
          },
          category: {
            select: { name: true, slug: true, protectMedia: true },
          },
          media: {
            select: { id: true, url: true, type: true, caption: true },
          },
          _count: { select: { likes: true } },
          poll: { select: { id: true } },
          comments: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              editedAt: true,
              imageUrl: true,
              status: true,
              takedownMessage: true,
              authorId: true,
              postId: true,
              parentId: true,
              author: {
                select: { username: true, image: true, role: true },
              },
              votes: { select: { type: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      })
    },
    ['post', displayId],
    { tags: [`post:${displayId}`], revalidate: 300 }
  )()
}

export const getCachedCategoryPosts = async (slug: string, currentPage: number, PAGE_SIZE: number) => {
  return unstable_cache(
    async () => {
      const category = await prisma.category.findUnique({
        where: { slug },
        select: { id: true, name: true, bannerUrl: true },
      })
      if (!category) return null;

      const [totalPosts, posts] = await Promise.all([
        prisma.post.count({ where: { categoryId: category.id, status: "ACTIVE" } }),
        prisma.post.findMany({
          where: { categoryId: category.id, status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          skip: (currentPage - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          select: postCardSelect,
        }),
      ])
      return { category, totalPosts, posts }
    },
    ['category-posts', slug, currentPage.toString(), PAGE_SIZE.toString()],
    { tags: ['posts', `category:${slug}`], revalidate: 300 }
  )()
}
