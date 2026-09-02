"use server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function resolveReport(reportId: string, deleteTarget: boolean) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) return false

  const report = await prisma.report.findUnique({ where: { id: reportId } })
  if (!report) return false

  if (deleteTarget) {
    if (report.commentId) {
      await prisma.comment.delete({ where: { id: report.commentId } })
    } else if (report.postId) {
      const post = await prisma.post.findUnique({ 
        where: { id: report.postId },
        include: { media: true }
      })
      
      if (post) {
        if (post.media && post.media.length > 0) {
          const { deleteCloudinaryMedia } = await import("@/lib/cloudinary")
          for (const m of post.media) {
            await deleteCloudinaryMedia(m.url, m.type as "IMAGE" | "VIDEO")
          }
        }
        await prisma.post.delete({ where: { id: report.postId } })
      }
    }
  } else {
    await prisma.report.update({
      where: { id: reportId },
      data: { status: "RESOLVED" }
    })
  }

  revalidatePath("/admin/reports")
  return true
}

export async function takedownReportTarget(reportId: string, reason: string, message: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) return false

  const report = await prisma.report.findUnique({ where: { id: reportId } })
  if (!report) return false

  const { logAdminAction } = await import("@/lib/adminLogger")

  if (report.commentId) {
    const comment = await prisma.comment.findUnique({ where: { id: report.commentId } })
    if (comment) {
      await prisma.comment.update({
        where: { id: report.commentId },
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
      await logAdminAction(session.user.id, "TAKEDOWN_COMMENT", `Gỡ bình luận ID: ${report.commentId} từ report - Lý do: ${reason}`)
    }
  } else if (report.postId) {
    const post = await prisma.post.findUnique({ where: { id: report.postId } })
    if (post) {
      await prisma.post.update({
        where: { id: report.postId },
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
      await logAdminAction(session.user.id, "TAKEDOWN_POST", `Gỡ bài viết ID: ${report.postId} từ report - Lý do: ${reason}`)
    }
  }

  // Update report status
  await prisma.report.update({
    where: { id: reportId },
    data: { status: "RESOLVED" }
  })

  revalidatePath("/admin/reports")
  return true
}
