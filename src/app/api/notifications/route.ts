import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json([], { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      actor: { select: { name: true, username: true, image: true } },
      post: { select: { title: true, displayId: true } }
    },
    take: 50 // Limit to last 50
  })

  return NextResponse.json(notifications)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ success: false }, { status: 401 })

  const { id } = await req.json().catch(() => ({}))

  if (id) {
    // Mark specific as read
    await prisma.notification.update({
      where: { id, userId: session.user.id },
      data: { read: true }
    })
  } else {
    // Mark all as read
    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true }
    })
  }

  return NextResponse.json({ success: true })
}
