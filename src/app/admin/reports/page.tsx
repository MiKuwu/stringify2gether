import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ReportsAdminClient from "./ReportsAdminClient"

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) {
    redirect("/")
  }

  const reports = await prisma.report.findMany({
    where: { status: "PENDING" },
    include: {
      post: true,
      comment: {
        include: {
          author: true,
          post: true
        }
      },
      reporter: true
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 border-b border-slate-300 dark:border-slate-700 pb-4">Hòm báo cáo chờ xử lý</h1>
      <ReportsAdminClient reports={reports} />
    </div>
  )
}
