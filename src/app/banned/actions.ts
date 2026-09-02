"use server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function submitAppeal(type: string, targetId: string, reason: string) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: "Bạn chưa đăng nhập." }

  try {
    const existing = await prisma.appeal.findFirst({
      where: { type, targetId, status: "PENDING" }
    })

    if (existing) {
      return { error: "Bạn đã gửi đơn kháng nghị rồi, đang chờ duyệt." }
    }

    await prisma.appeal.create({
      data: {
        type,
        targetId,
        reason
      }
    })

    return { success: true }
  } catch (err: any) {
    return { error: "Lỗi khi gửi kháng nghị: " + err.message }
  }
}
