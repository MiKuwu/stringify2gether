import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminSuggestionsClient from "./AdminSuggestionsClient"

export const dynamic = "force-dynamic"

export default async function AdminSuggestionsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) {
    redirect("/")
  }

  const suggestions = await prisma.suggestion.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { username: true, id: true, image: true, role: true }
      }
    }
  })

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } })

  return <AdminSuggestionsClient 
    initialSuggestions={suggestions} 
    initialMessage={settings?.feedbackPromptMessage || ""} 
    initialIcon={settings?.feedbackPromptIconUrl || ""} 
  />
}
