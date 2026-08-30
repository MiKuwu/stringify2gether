import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 })
  }

  // Only author can edit
  if (post.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { title, content, categoryId, newMedia, keptMedia, status, watermarkText, watermarkLogo, isAiGenerated, poll } = await request.json()

  if (!title || !categoryId) {
    return NextResponse.json({ error: "Thiếu tiêu đề hoặc chuyên mục" }, { status: 400 })
  }
  
  const finalContent = content || "<p><br></p>"

  const updateData: any = {
    title,
    content: finalContent,
    categoryId,
    watermarkText: watermarkText !== undefined ? watermarkText : null,
    watermarkLogo: watermarkLogo !== undefined ? watermarkLogo : null,
    isAiGenerated: !!isAiGenerated,
  }

  if (status) {
    updateData.status = status
  }

  if (keptMedia !== undefined && Array.isArray(keptMedia)) {
    const keptMediaIds = keptMedia.map((m: any) => m.id)
    // Delete media that is not in the kept list
    const mediaToDelete = await prisma.media.findMany({
      where: {
        postId: id,
        id: { notIn: keptMediaIds }
      }
    })

    if (mediaToDelete.length > 0) {
      const { deleteCloudinaryMedia } = await import("@/lib/cloudinary")
      for (const m of mediaToDelete) {
        await deleteCloudinaryMedia(m.url, m.type as "IMAGE" | "VIDEO")
      }
      
      await prisma.media.deleteMany({
        where: {
          postId: id,
          id: { notIn: keptMediaIds }
        }
      })
    }

    // Update captions for kept media
    for (const m of keptMedia) {
      await prisma.media.update({
        where: { id: m.id },
        data: { caption: m.caption }
      })
    }
  }

  if (newMedia && newMedia.length > 0) {
    updateData.media = {
      create: newMedia
    }
  }

  const updatedPost = await prisma.post.update({
    where: { id },
    data: updateData
  })

  
  const existingPoll = await prisma.poll.findUnique({ where: { postId: id }, include: { options: true } })

  if (poll === null) {
    if (existingPoll) await prisma.poll.delete({ where: { id: existingPoll.id } })
  } else if (poll !== undefined) {
    if (existingPoll) {
      await prisma.poll.update({
        where: { id: existingPoll.id },
        data: {
          question: poll.question,
          allowMultiple: poll.allowMultiple,
          hideResults: poll.hideResults,
          anonymous: poll.anonymous,
          expiresAt: poll.expiresAt,
        }
      })
      const existingOptionIds = existingPoll.options.map(o => o.id)
      const incomingOptionIds = poll.options.map((o: any) => o.id).filter((id: any) => id)
      
      const optionsToDelete = existingOptionIds.filter(id => !incomingOptionIds.includes(id))
      if (optionsToDelete.length > 0) {
        await prisma.pollOption.deleteMany({ where: { id: { in: optionsToDelete } } })
      }
      
      for (const opt of poll.options) {
        if (opt.id && existingOptionIds.includes(opt.id)) {
          await prisma.pollOption.update({
            where: { id: opt.id },
            data: { text: opt.text, imageUrl: opt.imageUrl }
          })
        } else {
          await prisma.pollOption.create({
            data: { pollId: existingPoll.id, text: opt.text, imageUrl: opt.imageUrl }
          })
        }
      }
    } else {
      await prisma.poll.create({
        data: {
          postId: id,
          question: poll.question,
          allowMultiple: poll.allowMultiple,
          hideResults: poll.hideResults,
          anonymous: poll.anonymous,
          expiresAt: poll.expiresAt,
          options: { create: poll.options.map((o: any) => ({ text: o.text, imageUrl: o.imageUrl })) }
        }
      })
    }
  }

  return NextResponse.json(updatedPost)

}
