import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Settings, Users, FileText, Layers, AlertTriangle, Book, List } from "lucide-react"
import AdminSidebar from "./AdminSidebar"
import { prisma } from "@/lib/prisma"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) {
    redirect("/")
  }

  const pendingSuggestions = await prisma.suggestion.count({ where: { status: "PENDING" } })
  const pendingAppeals = await prisma.appeal.count({ where: { status: "PENDING" } })
  const pendingReports = await prisma.report.count({ where: { status: "PENDING" } })

  return (
    <div className="container mx-auto py-8 flex flex-col md:flex-row gap-8 px-4">
      <AdminSidebar 
        pendingSuggestions={pendingSuggestions} 
        pendingAppeals={pendingAppeals} 
        pendingReports={pendingReports} 
      />
      <main className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
        {children}
      </main>
    </div>
  )
}
