import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"

type PollOptionInput = {
  text?: string | null
  imageUrl?: string | null
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userCheck = await prisma.user.findUnique({ where: { id: session.user.id }, select: { bannedUntil: true } })
  if (userCheck?.bannedUntil && new Date(userCheck.bannedUntil) > new Date()) {
    return NextResponse.json({ error: "Banned" }, { status: 403 })
  }

  const { title, content, categoryId, media, status, watermarkText, watermarkLogo, isAiGenerated, poll } = await request.json()

  if (!title || !categoryId) {
    return NextResponse.json({ error: "Thiếu tiêu đề hoặc chuyên mục" }, { status: 400 })
  }
  
  const finalContent = content || "<p><br></p>"

  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 })
  }

  let prefix = "ot"
  if (category.slug === "outbreak") prefix = "ob"
  if (category.slug === "lineup") prefix = "lu"

  const now = new Date()
  const ddmmyyhhmmss = 
    String(now.getDate()).padStart(2, '0') +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getFullYear()).slice(-2) +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0')

  const displayId = `${prefix}${ddmmyyhhmmss}`

  const post = await prisma.post.create({
    data: {
      displayId,
      title,
      content: finalContent,
      categoryId,
      authorId: session.user.id,
      status: status || "ACTIVE",
      watermarkText: watermarkText || null,
      watermarkLogo: watermarkLogo || null,
      isAiGenerated: !!isAiGenerated,
      media: {
        create: media
      }
    }
  })

  // Notify followers only if not a draft
  if (post.status !== "DRAFT") {
    const followers = await prisma.follows.findMany({
      where: { followingId: session.user.id }
    })

    if (followers.length > 0) {
      await prisma.notification.createMany({
        data: followers.map(f => ({
          userId: f.followerId,
          actorId: session.user.id,
          type: "NEW_POST",
          postId: post.id
        }))
      })
    }
  }

  // Create poll if provided
  if (poll && poll.question && poll.options && poll.options.length >= 2) {
    const pollOptions = poll.options as PollOptionInput[]
    await prisma.poll.create({
      data: {
        question: poll.question,
        allowMultiple: !!poll.allowMultiple,
        hideResults: !!poll.hideResults,
        anonymous: poll.anonymous !== false,
        expiresAt: poll.expiresAt ? new Date(poll.expiresAt) : null,
        postId: post.id,
        options: {
          create: pollOptions.filter(o => o.text || o.imageUrl).map(o => ({
            text: o.text || null,
            imageUrl: o.imageUrl || null
          }))
        }
      }
    })
  }

  if (post.status === "ACTIVE") {
    revalidateTag("posts", "max")
    revalidateTag(`category:${category.slug}`, "max")
  }

  return NextResponse.json(post)
}
