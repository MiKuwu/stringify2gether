"use server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath, updateTag } from "next/cache"

export async function saveRules(rulesContent: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) {
    return { error: "Bạn không có quyền thực hiện." }
  }

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { rulesContent },
    create: { id: 1, rulesContent }
  })

  const { logAdminAction } = await import("@/lib/adminLogger")
  await logAdminAction(session.user.id, "UPDATE_RULES", "Cập nhật Nội quy cộng đồng")

  updateTag("settings")
  revalidatePath("/")
  return { success: true }
}
