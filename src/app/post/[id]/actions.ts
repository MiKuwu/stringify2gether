"use server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath, updateTag } from "next/cache"
import { redirect } from "next/navigation"
import type { Prisma } from "@prisma/client"

function refreshCachedPost(displayId: string) {
  updateTag(`post:${displayId}`)
  revalidatePath(`/post/${displayId}`)
}

export async function toggleLike(postId: string) {
  const session = await getServerSession(authOptions)
  if (!session) return false

  const userId = session.user.id
  const [existingLike, post] = await Promise.all([
    prisma.like.findUnique({ where: { userId_postId: { userId, postId } } }),
    prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, displayId: true },
    }),
  ])
  if (!post) return false

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } })
  } else {
    await prisma.like.create({ data: { userId, postId } })
    
    if (post.authorId !== userId) {
      // Check if muted
      const isMuted = await prisma.mutedPost.findUnique({
        where: { userId_postId: { userId: post.authorId, postId } }
      })

      if (!isMuted) {
        // Create notification, avoiding duplicates if already liked before (but since we deleted previous likes, it might recreate. That's fine for simple behavior)
        const recentLikeNotif = await prisma.notification.findFirst({
          where: {
            userId: post.authorId,
            actorId: userId,
            type: "LIKE",
            postId: postId
          }
        })
        
        if (!recentLikeNotif) {
          await prisma.notification.create({
            data: {
              userId: post.authorId,
              actorId: userId,
              type: "LIKE",
              postId: postId
            }
          })
        }
      }
    }
  }
  refreshCachedPost(post.displayId)
  const likeCount = await prisma.like.count({ where: { postId } })
  return { liked: !existingLike, likeCount }
}

export async function toggleMutePost(postId: string) {
  const session = await getServerSession(authOptions)
  if (!session) return false

  const userId = session.user.id
  
  const existing = await prisma.mutedPost.findUnique({
    where: { userId_postId: { userId, postId } }
  })

  if (existing) {
    await prisma.mutedPost.delete({ where: { id: existing.id } })
  } else {
    await prisma.mutedPost.create({ data: { userId, postId } })
  }
  
  return true
}

export async function addComment(postId: string, content: string, parentId?: string, imageUrl?: string) {
  const session = await getServerSession(authOptions)
  if (!session) return false

  const newComment = await prisma.comment.create({
    data: {
      content,
      postId,
      parentId: parentId || null,
      authorId: session.user.id,
      imageUrl: imageUrl || null
    },
    include: {
      post: { select: { authorId: true, displayId: true } },
      parent: { select: { authorId: true } },
    }
  })

  // Notification Logic
  let receiverId: string | null = null
  const notifType = "REPLY"

  if (parentId && newComment.parent) {
    receiverId = newComment.parent.authorId
  } else {
    receiverId = newComment.post.authorId
  }

  // Only notify if not self, and if receiver hasn't muted the post
  if (receiverId && receiverId !== session.user.id) {
    const isMuted = await prisma.mutedPost.findUnique({
      where: { userId_postId: { userId: receiverId, postId } }
    })
    
    if (!isMuted) {
      await prisma.notification.create({
        data: {
          userId: receiverId,
          actorId: session.user.id,
          type: notifType,
          postId: postId,
          commentId: newComment.id
        }
      })
    }
  }

  refreshCachedPost(newComment.post.displayId)
  return true
}

export async function deletePost(postId: string, noRedirect?: boolean) {
  const session = await getServerSession(authOptions)
  if (!session) return false

  const post = await prisma.post.findUnique({ 
    where: { id: postId },
    include: {
      media: true,
      author: { select: { role: true } },
      category: { select: { slug: true } },
    }
  })
  if (!post) return false
  
  const isAuthor = post.authorId === session.user.id
  let canDelete = false
  if (isAuthor) {
    canDelete = true
  } else {
    const myRole = session.user.role
    const authorRole = post.author.role
    if (myRole === "ADMIN + FOUNDER") {
      canDelete = true
    } else if (myRole === "ADMIN" && authorRole === "USER") {
      canDelete = true
    }
  }
  
  if (!canDelete) return false

  // Delete media from Cloudinary
  if (post.media && post.media.length > 0) {
    const { deleteCloudinaryMedia } = await import("@/lib/cloudinary")
    for (const m of post.media) {
      await deleteCloudinaryMedia(m.url, m.type as "IMAGE" | "VIDEO")
    }
  }

  await prisma.post.delete({ where: { id: postId } })
  updateTag("posts")
  updateTag(`category:${post.category.slug}`)
  updateTag(`post:${post.displayId}`)
  
  if (noRedirect) {
    revalidatePath("/profile")
    return true
  }
  
  redirect("/")
}

export async function takedownPost(postId: string, reason: string, message: string) {
  const session = await getServerSession(authOptions)
  if (!session) return false

  const post = await prisma.post.findUnique({ 
    where: { id: postId },
    include: {
      author: { select: { role: true } },
      category: { select: { slug: true } },
    }
  })
  if (!post) return false

  let canTakedown = false
  const myRole = session.user.role
  const authorRole = post.author.role
  if (myRole === "ADMIN + FOUNDER") {
    canTakedown = true
  } else if (myRole === "ADMIN" && authorRole === "USER") {
    canTakedown = true
  }

  if (!canTakedown) return false
  
  await prisma.post.update({
    where: { id: postId },
    data: {
      status: "TAKEDOWN",
      takedownReason: reason,
      takedownMessage: message,
      takedownAt: new Date()
    }
  })
  
  if (post.authorId !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        actorId: session.user.id,
        type: "TAKEDOWN",
        postId: post.id
      }
    })
  }

  const { logAdminAction } = await import("@/lib/adminLogger")
  await logAdminAction(session.user.id, "TAKEDOWN_POST", `Gỡ bài viết ID: ${post.displayId} - Lý do: ${reason}`)

  updateTag("posts")
  updateTag(`category:${post.category.slug}`)
  updateTag(`post:${post.displayId}`)
  redirect("/")
}

export async function addReport(postId: string, reason: string) {
  const session = await getServerSession(authOptions)
  if (!session) return false

  await prisma.report.create({
    data: {
      postId,
      reason,
      reporterId: session.user.id
    }
  })
  return true
}

export async function voteComment(commentId: string, type: 1 | -1 | 0) {
  const session = await getServerSession(authOptions)
  if (!session) return false

  const userId = session.user.id
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      authorId: true,
      postId: true,
      post: { select: { displayId: true } },
    },
  })
  if (!comment) return false
  
  if (type === 0) {
    // Remove vote
    await prisma.commentVote.deleteMany({
      where: { userId, commentId }
    })
  } else {
    // Upsert vote
    await prisma.commentVote.upsert({
      where: { userId_commentId: { userId, commentId } },
      update: { type },
      create: { userId, commentId, type }
    })

    // Send notification
    if (comment.authorId !== userId) {
      const isMuted = await prisma.mutedPost.findUnique({
        where: { userId_postId: { userId: comment.authorId, postId: comment.postId } }
      })

      if (!isMuted) {
        await prisma.notification.create({
          data: {
            userId: comment.authorId,
            actorId: userId,
            type: type === 1 ? "UPVOTE" : "DOWNVOTE",
            postId: comment.postId,
            commentId: comment.id
          }
        })
      }
    }
  }

  refreshCachedPost(comment.post.displayId)
  return true
}

export async function toggleSavePost(postId: string) {
  const session = await getServerSession(authOptions)
  if (!session) return false

  const userId = session.user.id
  
  const existing = await prisma.savedPost.findUnique({
    where: { userId_postId: { userId, postId } }
  })
  
  if (existing) {
    await prisma.savedPost.delete({ where: { id: existing.id } })
  } else {
    await prisma.savedPost.create({ data: { userId, postId } })
  }
  return true
}

export async function editComment(commentId: string, content: string, imageUrl?: string | null) {
  const session = await getServerSession(authOptions)
  if (!session) return false

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      authorId: true,
      postId: true,
      post: { select: { displayId: true } },
    },
  })
  if (!comment || comment.authorId !== session.user.id) return false

  const dataToUpdate: Prisma.CommentUpdateInput = {
    content,
    editedAt: new Date()
  }
  
  if (imageUrl !== undefined) {
    dataToUpdate.imageUrl = imageUrl
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: dataToUpdate
  })
  
  refreshCachedPost(comment.post.displayId)
  return true
}

export async function deleteComment(commentId: string) {
  const session = await getServerSession(authOptions)
  if (!session) return false

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      authorId: true,
      postId: true,
      post: { select: { displayId: true } },
    },
  })
  if (!comment || comment.authorId !== session.user.id) return false

  await prisma.comment.delete({ where: { id: commentId } })
  
  refreshCachedPost(comment.post.displayId)
  return true
}

export async function takedownComment(commentId: string, reason: string, message: string) {
  const session = await getServerSession(authOptions)
  if (!session) return false

  const comment = await prisma.comment.findUnique({ 
    where: { id: commentId },
    include: {
      author: { select: { role: true } },
      post: { select: { displayId: true } },
    }
  })
  if (!comment) return false

  let canTakedown = false
  const myRole = session.user.role
  const authorRole = comment.author.role
  
  if (myRole === "ADMIN + FOUNDER") {
    canTakedown = true
  } else if (myRole === "ADMIN" && authorRole === "USER") {
    canTakedown = true
  }

  if (!canTakedown) return false

  await prisma.comment.update({
    where: { id: commentId },
    data: {
      status: "TAKEDOWN",
      takedownReason: reason,
      takedownMessage: message,
      takedownAt: new Date()
    }
  })

  if (comment.authorId !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId: comment.authorId,
        actorId: session.user.id,
        type: "COMMENT_TAKEDOWN",
        postId: comment.postId,
        commentId: comment.id
      }
    })
  }

  const { logAdminAction } = await import("@/lib/adminLogger")
  await logAdminAction(session.user.id, "TAKEDOWN_COMMENT", `Gỡ bình luận ID: ${commentId} - Lý do: ${reason}`)
  
  refreshCachedPost(comment.post.displayId)
  return true
}

export async function addReportComment(commentId: string, reason: string) {
  const session = await getServerSession(authOptions)
  if (!session) return false

  await prisma.report.create({
    data: {
      commentId,
      reason,
      reporterId: session.user.id
    }
  })
  return true
}

export async function summarizePost(postId: string) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: "Yêu cầu đăng nhập" }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } })
  if (!settings?.geminiApiKey) {
    return { error: "Chưa cấu hình API Key cho AI" }
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { title: true, content: true }
  })
  if (!post) return { error: "Không tìm thấy bài viết" }

  // Strip simple HTML tags for better AI reading
  const cleanContent = post.content.replace(/<[^>]*>?/gm, '')
  
  const prompt = `Tóm tắt bài viết sau một cách ngắn gọn, súc tích bằng tiếng Việt trong khoảng 3-5 gạch đầu dòng.
Tiêu đề: ${post.title}
Nội dung:
${cleanContent}`

  try {
    const apiKey = settings.geminiApiKey.trim()
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error("Gemini API Error:", res.status, errorText)
      return { error: `Lỗi AI API (${res.status}): ${errorText.substring(0, 200)}` }
    }

    const data = await res.json()
    const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!summary) {
      return { error: "Không thể trích xuất tóm tắt" }
    }

    return { summary }
  } catch {
    return { error: "Lỗi kết nối đến AI" }
  }
}
