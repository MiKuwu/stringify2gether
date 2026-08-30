"use server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export async function findPostByDisplayId(displayId: string) {
  const post = await prisma.post.findUnique({
    where: { displayId },
    include: { author: true }
  })
  return post
}

export async function deletePostAdmin(displayId: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) return false

  const post = await prisma.post.findUnique({ 
    where: { displayId },
    include: { media: true }
  })
  
  if (!post) return false

  // Delete media from Cloudinary
  if (post.media && post.media.length > 0) {
    const { deleteCloudinaryMedia } = await import("@/lib/cloudinary")
    for (const m of post.media) {
      await deleteCloudinaryMedia(m.url, m.type as "IMAGE" | "VIDEO")
    }
  }

  await prisma.post.delete({
    where: { displayId }
  })
  
  revalidatePath("/admin/posts")
  return true
}
