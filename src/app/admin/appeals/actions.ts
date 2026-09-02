"use server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { deleteCloudinaryMedia } from "@/lib/cloudinary"

export async function voteAppeal(appealId: string, voteType: "KEEP" | "DELETE") {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) return { error: "Unauthorized" }

  const existingVote = await prisma.appealVote.findUnique({
    where: { appealId_adminId: { appealId, adminId: session.user.id } }
  })

  if (existingVote) {
    await prisma.appealVote.update({
      where: { id: existingVote.id },
      data: { vote: voteType }
    })
  } else {
    await prisma.appealVote.create({
      data: {
        appealId,
        adminId: session.user.id,
        vote: voteType
      }
    })
  }

  revalidatePath("/admin/appeals")
  return { success: true }
}

export async function resolveAppeal(appealId: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) return { error: "Unauthorized" }

  const appeal = await prisma.appeal.findUnique({
    where: { id: appealId },
    include: { votes: true }
  })

  if (!appeal) return { error: "Không tìm thấy đơn kháng nghị" }
  if (appeal.status !== "PENDING") return { error: "Đơn này đã được giải quyết" }

  const keepVotes = appeal.votes.filter(v => v.vote === "KEEP").length
  const deleteVotes = appeal.votes.filter(v => v.vote === "DELETE").length

  const finalStatus = deleteVotes >= keepVotes ? "RESOLVED_DELETE" : "RESOLVED_KEEP"

  if (appeal.type === "POST_TAKEDOWN") {
    if (finalStatus === "RESOLVED_DELETE") {
      const post = await prisma.post.findUnique({ where: { id: appeal.targetId }, include: { media: true } })
      if (post) {
        for (const m of post.media) {
          await deleteCloudinaryMedia(m.url, m.type as "IMAGE" | "VIDEO")
        }
        await prisma.post.delete({ where: { id: appeal.targetId } })
      }
    } else {
      await prisma.post.update({
        where: { id: appeal.targetId },
        data: {
          status: "ACTIVE",
          takedownReason: null,
          takedownMessage: null,
          takedownAt: null
        }
      })
    }
  } else if (appeal.type === "USER_BAN") {
    if (finalStatus === "RESOLVED_KEEP") {
      await prisma.user.update({
        where: { id: appeal.targetId },
        data: {
          bannedUntil: null,
          banReason: null,
          banMessage: null,
          bannedAt: null
        }
      })
      
      // Xóa vết phạt (log) gần nhất để không bị cộng dồn vào quy tắc 3=1
      const latestBanLog = await prisma.adminLog.findFirst({
        where: {
          action: "BAN_USER",
          details: {
            contains: `ID: ${appeal.targetId}`
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      if (latestBanLog) {
        await prisma.adminLog.delete({
          where: { id: latestBanLog.id }
        })
      }
    }
  } else if (appeal.type === "COMMENT_TAKEDOWN") {
    if (finalStatus === "RESOLVED_DELETE") {
      await prisma.comment.delete({ where: { id: appeal.targetId } })
    } else {
      await prisma.comment.update({
        where: { id: appeal.targetId },
        data: {
          status: "ACTIVE",
          takedownReason: null,
          takedownMessage: null,
          takedownAt: null
        }
      })
    }
  }

  await prisma.appeal.update({
    where: { id: appealId },
    data: {
      status: finalStatus,
      resolvedAt: new Date()
    }
  })

  const { logAdminAction } = await import("@/lib/adminLogger")
  await logAdminAction(session.user.id, "RESOLVE_APPEAL", `Chốt đơn kháng nghị ID: ${appealId} (Kết quả: ${finalStatus})`)

  revalidatePath("/admin/appeals")
  return { success: true }
}
