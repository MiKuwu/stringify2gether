"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath, updateTag } from "next/cache"

export async function addCategory(formData: FormData) {
  const name = formData.get("name") as string
  const slug = formData.get("slug") as string

  if (name && slug) {
    const count = await prisma.category.count()
    await prisma.category.create({
      data: { name, slug, orderIndex: count }
    })
    updateTag("categories")
    revalidatePath("/admin/categories")
    revalidatePath("/")
  }
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      posts: { include: { media: true } }
    }
  })

  if (category) {
    const { deleteCloudinaryMedia } = await import("@/lib/cloudinary")
    if (category.bannerUrl && category.bannerUrl.includes('cloudinary.com')) {
      await deleteCloudinaryMedia(category.bannerUrl, "IMAGE")
    }

    for (const post of category.posts) {
      if (post.media && post.media.length > 0) {
        for (const m of post.media) {
          await deleteCloudinaryMedia(m.url, m.type as "IMAGE" | "VIDEO")
        }
      }
    }
  }

  await prisma.category.delete({ where: { id } })
  updateTag("categories")
  updateTag("posts")
  if (category) updateTag(`category:${category.slug}`)
  revalidatePath("/admin/categories")
  revalidatePath("/")
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function updateCategory(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) return
  
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const slug = formData.get("slug") as string
  const bannerUrl = formData.get("bannerUrl") as string
  const hoverImageUrl = formData.get("hoverImageUrl") as string
  const protectMedia = formData.get("protectMedia") === "true"
  
  if (!id || !name || !slug) return

  const oldCategory = await prisma.category.findUnique({ where: { id } })
  if (oldCategory && oldCategory.bannerUrl && oldCategory.bannerUrl !== bannerUrl && oldCategory.bannerUrl.includes('cloudinary.com')) {
    const { deleteCloudinaryMedia } = await import("@/lib/cloudinary")
    await deleteCloudinaryMedia(oldCategory.bannerUrl, "IMAGE")
  }
  
  if (oldCategory && oldCategory.hoverImageUrl && oldCategory.hoverImageUrl !== hoverImageUrl && oldCategory.hoverImageUrl.includes('cloudinary.com')) {
    const { deleteCloudinaryMedia } = await import("@/lib/cloudinary")
    await deleteCloudinaryMedia(oldCategory.hoverImageUrl, "IMAGE")
  }

  await prisma.category.update({
    where: { id },
    data: { name, slug, bannerUrl: bannerUrl || null, hoverImageUrl: hoverImageUrl || null, protectMedia }
  })
  updateTag("categories")
  updateTag("posts")
  if (oldCategory) updateTag(`category:${oldCategory.slug}`)
  updateTag(`category:${slug}`)
  revalidatePath("/admin/categories")
  revalidatePath("/")
}

export async function reorderCategories(orderedIds: string[]) {
  // Use a transaction to update all orderIndexes
  await prisma.$transaction(
    orderedIds.map((id, index) => 
      prisma.category.update({
        where: { id },
        data: { orderIndex: index }
      })
    )
  )
  updateTag("categories")
  revalidatePath("/admin/categories")
  revalidatePath("/")
}
