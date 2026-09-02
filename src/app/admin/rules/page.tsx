import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminRulesClient from "./AdminRulesClient"

export const metadata = {
  title: "Admin - Nội quy cộng đồng",
}

export default async function AdminRulesPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) {
    redirect("/")
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } })
  const initialContent = settings?.rulesContent || ""

  return <AdminRulesClient initialContent={initialContent} />
}
