import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get("postId")
  if (!postId) return NextResponse.json({ alreadyAppealed: false })

  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ alreadyAppealed: false })

  const appeal = await prisma.appeal.findFirst({
    where: { type: "POST_TAKEDOWN", targetId: postId, status: "PENDING" },
    select: { id: true }
  })
  return NextResponse.json({ alreadyAppealed: !!appeal })
}