"use server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

import { findUserByCustomId as findUser } from "@/lib/user"

export async function findUserByCustomId(customId: string) {
  return await findUser(customId)
}

export async function banUser(userId: string, hours: number, reason?: string, message?: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) return false

  let bannedUntil = null
  let banReason = null
  let banMessage = null
  let bannedAt = null

  const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  if (!targetUser) return false

  let canBan = false
  const myRole = session.user.role
  const authorRole = targetUser.role
  if (myRole === "ADMIN + FOUNDER") {
    canBan = true
  } else if (myRole === "ADMIN" && authorRole === "USER") {
    canBan = true
  }

  if (!canBan) return false

  if (hours > 0) {
    bannedUntil = new Date()
    bannedUntil.setHours(bannedUntil.getHours() + hours)
    banReason = reason
    banMessage = message
    bannedAt = new Date()
  } else if (hours === -1) {
    bannedUntil = new Date("2099-12-31T23:59:59Z")
    banReason = reason
    banMessage = message
    bannedAt = new Date()
  }

  await prisma.user.update({
    where: { id: userId },
    data: { bannedUntil, banReason, banMessage, bannedAt }
  })
  const { logAdminAction } = await import("@/lib/adminLogger")
  const banText = hours === -1 ? "vĩnh viễn" : hours === 0 ? "gỡ khóa" : `${hours} giờ`
  await logAdminAction(session.user.id, "BAN_USER", `Khóa tài khoản ID: ${userId} (${banText})`)
  revalidatePath("/admin/users")
  return true
}

export async function addAdmin(userId: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN + FOUNDER") return { error: "Bạn không có quyền thực hiện (chỉ Founder)." }

  await prisma.user.update({
    where: { id: userId },
    data: { role: "ADMIN" }
  })
  const { logAdminAction } = await import("@/lib/adminLogger")
  await logAdminAction(session.user.id, "ADD_ADMIN", `Thêm quyền Admin cho tài khoản ID: ${userId}`)
  revalidatePath("/admin/users")
  return { success: true }
}

export async function removeAdmin(userId: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN + FOUNDER") return { error: "Bạn không có quyền thực hiện (chỉ Founder)." }

  await prisma.user.update({
    where: { id: userId },
    data: { role: "USER" }
  })
  const { logAdminAction } = await import("@/lib/adminLogger")
  await logAdminAction(session.user.id, "REMOVE_ADMIN", `Tước quyền Admin của tài khoản ID: ${userId}`)
  revalidatePath("/admin/users")
  return { success: true }
}
