import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function checkBanAndRedirect() {
  const session = await getServerSession(authOptions)
  if (!session) return false

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { bannedUntil: true }
  })

  if (user?.bannedUntil && new Date(user.bannedUntil) > new Date()) {
    redirect("/banned")
  }

  return true
}

export async function isBanned() {
  const session = await getServerSession(authOptions)
  if (!session) return false
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { bannedUntil: true }
  })
  return user?.bannedUntil && new Date(user.bannedUntil) > new Date()
}
