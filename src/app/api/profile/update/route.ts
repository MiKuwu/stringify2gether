import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { username, regionCode, bio, facebookUrl, discordUrl, youtubeUrl } = await request.json()

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const updateData: any = { regionCode, bio, facebookUrl, discordUrl, youtubeUrl }

  // Check username change rules
  if (username && username !== user.username) {
    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) {
      return NextResponse.json({ error: "Username đã tồn tại" }, { status: 400 })
    }

    const now = new Date()
    const lastChange = user.lastUsernameChange ? new Date(user.lastUsernameChange) : null
    if (lastChange) {
      const daysSinceChange = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceChange < 14) {
        return NextResponse.json({ error: "Bạn chỉ có thể đổi tên 14 ngày 1 lần" }, { status: 400 })
      }
    }

    updateData.username = username
    updateData.lastUsernameChange = now
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: updateData
  })

  return NextResponse.json({ success: true })
}
