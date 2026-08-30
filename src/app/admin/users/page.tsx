import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import UsersAdminClient from "./UsersAdminClient"

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) {
    redirect("/")
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 border-b border-slate-300 dark:border-slate-700 pb-4">Quản lý Thành viên</h1>
      <UsersAdminClient isFounder={session.user.role === "ADMIN + FOUNDER"} />
    </div>
  )
}
