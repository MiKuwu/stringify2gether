import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import CreatePostForm from "./CreatePostForm"
import { checkBanAndRedirect } from "@/lib/checkBan"

export default async function CreatePostPage({ searchParams }: { searchParams: Promise<{ categoryId?: string }> }) {
  const { categoryId } = await searchParams
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/")
  }

  await checkBanAndRedirect()

  const user = await prisma.user.findUnique({ where: { id: session.user.id }})
  if (!user?.username) {
    // If no username set, redirect to profile to set it
    redirect("/profile?setup=1")
  }

  const categories = await prisma.category.findMany({ orderBy: { orderIndex: 'asc' } })

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Đăng bài viết mới</h1>
      <CreatePostForm categories={categories} defaultCategoryId={categoryId} />
    </div>
  )
}
