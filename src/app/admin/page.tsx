import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import AdminSettingsClient from "./AdminSettingsClient"

export default async function AdminSiteSettings() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) {
    redirect("/")
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Cài đặt chung</h1>
      <AdminSettingsClient settings={settings} userRole={session.user.role} />
    </div>
  )
}
