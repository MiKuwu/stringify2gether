import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import PunishmentsClient from "./PunishmentsClient"

export const metadata = {
  title: "Admin - Nhật ký xử phạt",
}

export default async function AdminPunishmentsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) {
    redirect("/")
  }

  const banLogs = await prisma.adminLog.findMany({
    where: { action: "BAN_USER" },
    orderBy: { createdAt: "desc" },
    include: {
      admin: {
        select: { name: true, username: true, image: true }
      }
    }
  })

  // Parse details to extract user ID and group by user
  // details format: Khóa tài khoản ID: <userId> (<banText>)
  const userBanCounts: Record<string, { count: number, logs: typeof banLogs }> = {}

  for (const log of banLogs) {
    const match = log.details.match(/ID:\s*([a-zA-Z0-9_-]+)/)
    if (match && match[1]) {
      const userId = match[1]
      if (!userBanCounts[userId]) {
        userBanCounts[userId] = { count: 0, logs: [] }
      }
      
      const isUnban = log.details.toLowerCase().includes("gỡ khóa")
      if (!isUnban) {
        userBanCounts[userId].count++
      }
      
      userBanCounts[userId].logs.push(log)
    }
  }

  // Fetch user info for those users
  const userIds = Object.keys(userBanCounts)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true, username: true, email: true, bannedUntil: true }
  })

  const { getCustomIdForUser } = await import("@/lib/user")
  const usersMap = await Promise.all(users.map(async (user) => {
    return {
      ...user,
      customId: await getCustomIdForUser(user.id)
    }
  })).then(results => results.reduce((acc, user) => {
    acc[user.id] = user
    return acc
  }, {} as Record<string, any>))

  const formattedData = userIds.map(userId => {
    const user = usersMap[userId] || {
      id: userId,
      name: null,
      username: "Tài khoản đã xóa",
      image: null,
      email: null,
      bannedUntil: null,
      customId: userId
    }
    const data = userBanCounts[userId]
    return {
      ...user,
      count: data.count,
      logs: data.logs
    }
  }).sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-teal-400 uppercase tracking-widest drop-shadow-md">Nhật Ký Xử Phạt</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">Quản lý lịch sử khóa tài khoản để áp dụng quy tắc tịnh tiến (Ví dụ: 3 lần 12h = 1 lần 24h).</p>
      
      <PunishmentsClient initialData={formattedData} />
    </div>
  )
}
