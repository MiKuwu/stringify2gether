import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function DELETE(request: Request, { params }: { params: Promise<{ pollId: string }> }) {
  const { pollId } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const poll = await prisma.poll.findUnique({ where: { id: pollId }, include: { post: true } })
  if (!poll) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isOwner = (poll.post as any).authorId === session.user.id
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "ADMIN + FOUNDER"
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.poll.delete({ where: { id: pollId } })
  return NextResponse.json({ success: true })
}