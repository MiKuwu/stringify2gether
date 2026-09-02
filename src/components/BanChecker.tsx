import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function BanChecker() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { bannedUntil: true }
  })

  if (user?.bannedUntil && new Date(user.bannedUntil) > new Date()) {
    redirect("/banned")
  }

  return null
}
