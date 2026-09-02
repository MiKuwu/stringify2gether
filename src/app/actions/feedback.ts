"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath, updateTag } from "next/cache"

export async function submitSuggestion(content: string, imageUrls: string[]) {
  const session = await getServerSession(authOptions)
  
  await prisma.suggestion.create({
    data: {
      content,
      images: JSON.stringify(imageUrls),
      authorId: session?.user?.id || null
    }
  })
  
  return true
}

export async function resolveSuggestion(id: string, status: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) return false

  await prisma.suggestion.update({
    where: { id },
    data: { status }
  })
  
  revalidatePath("/admin/suggestions")
  return true
}

export async function deleteSuggestion(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) return false

  await prisma.suggestion.delete({
    where: { id }
  })
  
  revalidatePath("/admin/suggestions")
  return true
}

export async function updateFeedbackSettings(message: string, iconUrl: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) return false

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      feedbackPromptMessage: message || null,
      feedbackPromptIconUrl: iconUrl || null
    },
    create: {
      id: 1,
      feedbackPromptMessage: message || null,
      feedbackPromptIconUrl: iconUrl || null
    }
  })

  updateTag("settings")
  revalidatePath("/")
  revalidatePath("/admin/suggestions")
  return true
}
