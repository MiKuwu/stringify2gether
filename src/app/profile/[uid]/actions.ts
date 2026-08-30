"use server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export async function toggleFollow(targetUserId: string) {
  const session = await getServerSession(authOptions)
  if (!session) return false

  const existing = await prisma.follows.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUserId
      }
    }
  })

  if (existing) {
    await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId
        }
      }
    })
  } else {
    await prisma.follows.create({
      data: {
        followerId: session.user.id,
        followingId: targetUserId
      }
    })
  }

  revalidatePath(`/profile/[uid]`, "page")
  return true
}
