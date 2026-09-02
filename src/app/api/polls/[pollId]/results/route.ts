import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ pollId: string }> }) {
  const { pollId } = await params
  const session = await getServerSession(authOptions)

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: {
      options: {
        include: {
          votes: {
            include: { user: { select: { username: true, image: true } } }
          }
        }
      },
      votes: true,
      post: { select: { authorId: true } }
    }
  })

  if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 })

  const isExpired = poll.expiresAt ? new Date() > new Date(poll.expiresAt) : false
  const isOwner = session?.user?.id === (poll.post as any)?.authorId
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "ADMIN + FOUNDER"
  const hasVoted = session ? (poll.votes as any[]).some((v: any) => v.userId === session.user.id) : false
  const showResults = !poll.hideResults || isExpired || isOwner || isAdmin || hasVoted
  const userVotedOptionIds = session ? (poll.votes as any[]).filter((v: any) => v.userId === session.user.id).map((v: any) => v.optionId) : []
  const totalVotes = poll.votes.length

  const options = (poll.options as any[]).map((opt: any) => ({
    id: opt.id,
    text: opt.text,
    imageUrl: opt.imageUrl,
    voteCount: showResults ? opt.votes.length : null,
    percentage: showResults && totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : null,
    voters: showResults && !poll.anonymous ? opt.votes.map((v: any) => ({
      username: v.user.username || "Anonymous",
      image: v.user.image
    })) : null,
  }))

  return NextResponse.json({
    id: poll.id,
    question: poll.question,
    allowMultiple: poll.allowMultiple,
    hideResults: poll.hideResults,
    anonymous: poll.anonymous,
    expiresAt: poll.expiresAt,
    isExpired,
    showResults,
    hasVoted,
    userVotedOptionIds,
    totalVotes: showResults ? totalVotes : null,
    options
  })
}