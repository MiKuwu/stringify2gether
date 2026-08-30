import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/post-interactions?postId=xxx&authorId=yyy
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get("postId")
  const authorId = searchParams.get("authorId")

  if (!postId || !authorId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 })
  }

  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({
      hasLiked: false,
      hasSaved: false,
      isMuted: false,
      isFollowing: false,
      isAuthor: false,
      canDelete: false,
      postAppeal: null,
      commentAppeals: {},
    })
  }

  const userId = session.user.id
  const role = session.user.role
  const isAuthor = userId === authorId
  const isAdminOrFounder = role === "ADMIN" || role === "ADMIN + FOUNDER"

  const [likeCheck, saveCheck, muteCheck, followCheck] = await Promise.all([
    prisma.like.findUnique({ where: { userId_postId: { userId, postId } }, select: { userId: true } }),
    prisma.savedPost.findUnique({ where: { userId_postId: { userId, postId } }, select: { userId: true } }),
    prisma.mutedPost.findUnique({ where: { userId_postId: { userId, postId } }, select: { userId: true } }),
    (!isAuthor ? prisma.follows.findUnique({
      where: { followerId_followingId: { followerId: userId, followingId: authorId } },
      select: { followerId: true }
    }) : Promise.resolve(null)),
  ])

  let canDelete = isAuthor || isAdminOrFounder
  if (!canDelete && role === "ADMIN") {
    // ADMIN can delete USER posts but not other admin posts — check author role
    const author = await prisma.user.findUnique({ where: { id: authorId }, select: { role: true } })
    canDelete = author?.role === "USER"
  }

  return NextResponse.json({
    hasLiked: !!likeCheck,
    hasSaved: !!saveCheck,
    isMuted: !!muteCheck,
    isFollowing: !!followCheck,
    isAuthor,
    canDelete,
    postAppeal: null, // fetched separately only for takedown posts
    commentAppeals: {},
  })
}