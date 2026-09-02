import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import PostsAdminClient from "./PostsAdminClient"

export default async function AdminPostsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) {
    redirect("/")
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 border-b border-slate-300 dark:border-slate-700 pb-4">Quản lý Bài viết</h1>
      <PostsAdminClient />
    </div>
  )
}
