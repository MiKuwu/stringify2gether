import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import AppealsAdminClient from "./AppealsAdminClient"

export const metadata = {
  title: "Admin Appeals",
}

export default async function AdminAppealsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) {
    redirect("/")
  }

  const appeals = await prisma.appeal.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      votes: {
        include: { admin: true }
      }
    }
  })

  const totalAdminsCount = await prisma.user.count({
    where: {
      role: { in: ["ADMIN", "ADMIN + FOUNDER"] }
    }
  })

  // Enhance appeals with Target data
  const enhancedAppeals = await Promise.all(appeals.map(async (appeal) => {
    let targetData: any = null
    
    if (appeal.type === "POST_TAKEDOWN") {
      const post = await prisma.post.findUnique({
        where: { id: appeal.targetId },
        include: { author: true }
      })
      if (post) {
        targetData = {
          title: post.title,
          url: `/post/${post.displayId}`,
          adminReason: post.takedownReason,
          authorName: post.author.username || "Ẩn danh"
        }
      }
    } else if (appeal.type === "USER_BAN") {
      const user = await prisma.user.findUnique({
        where: { id: appeal.targetId }
      })
      if (user) {
        targetData = {
          title: user.username || "Ẩn danh",
          url: null,
          adminReason: user.banReason,
          authorName: user.username || "Ẩn danh"
        }
      }
    } else if (appeal.type === "COMMENT_TAKEDOWN") {
      const comment = await prisma.comment.findUnique({
        where: { id: appeal.targetId },
        include: { author: true, post: true }
      })
      if (comment) {
        targetData = {
          title: `Bình luận: "${comment.content.substring(0, 50)}${comment.content.length > 50 ? '...' : ''}"`,
          url: comment.post ? `/post/${comment.post.displayId}` : null,
          adminReason: comment.takedownReason,
          authorName: comment.author.username || "Ẩn danh"
        }
      }
    }

    return {
      ...appeal,
      targetData
    }
  }))

  const validAppeals = enhancedAppeals.filter(a => a.targetData !== null)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-teal-400 uppercase tracking-widest drop-shadow-md">Đơn Kháng Nghị</h1>
      <p className="text-slate-600 dark:text-slate-400">Danh sách các bài viết hoặc tài khoản đang xin kháng cáo. Yêu cầu toàn bộ Admin vào đánh giá và biểu quyết.</p>

      {validAppeals.length === 0 ? (
        <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded text-center text-slate-500">
          Hiện tại không có đơn kháng nghị nào đang chờ duyệt.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {validAppeals.map(appeal => (
            <AppealsAdminClient 
              key={appeal.id} 
              appeal={appeal as any} 
              currentAdminId={session.user.id} 
              isFounder={session.user.role === "ADMIN + FOUNDER"}
              totalAdminsCount={totalAdminsCount}
            />
          ))}
        </div>
      )}
    </div>
  )
}
