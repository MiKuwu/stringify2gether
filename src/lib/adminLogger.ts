import { prisma } from "@/lib/prisma"

export async function logAdminAction(adminId: string, action: string, details: string) {
  try {
    await prisma.adminLog.create({
      data: { adminId, action, details }
    })
  } catch (err) {
    console.error("Failed to log admin action", err)
  }
}
