import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Delete the user from the database
    // Prisma will cascade delete related records (posts, comments, likes, follows, accounts, sessions) if onDelete: Cascade is configured.
    // Let's verify our schema has cascade. Accounts, Sessions, Follows, Comments, Likes all have onDelete: Cascade.
    // Wait, Post does not have onDelete: Cascade for Author in our schema!
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        posts: { include: { media: true } }
      }
    })

    if (user) {
      const { deleteCloudinaryMedia } = await import("@/lib/cloudinary")
      
      // Delete avatar and cover
      if (user.image && user.image.includes('cloudinary.com')) {
        await deleteCloudinaryMedia(user.image, "IMAGE")
      }
      if (user.coverImage && user.coverImage.includes('cloudinary.com')) {
        await deleteCloudinaryMedia(user.coverImage, "IMAGE")
      }

      // Delete all media from user's posts
      for (const post of user.posts) {
        if (post.media && post.media.length > 0) {
          for (const m of post.media) {
            await deleteCloudinaryMedia(m.url, m.type as "IMAGE" | "VIDEO")
          }
        }
      }
    }

    // So we must manually delete posts first, or just rely on manual deletion of everything.
    await prisma.$transaction(async (tx) => {
      // Delete Posts (this cascades to media, comments, likes, reports)
      await tx.post.deleteMany({
        where: { authorId: session.user.id }
      })
      
      // Delete the user (this cascades to everything else)
      await tx.user.delete({
        where: { id: session.user.id }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
