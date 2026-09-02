import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import EditPostForm from "./EditPostForm"

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) redirect("/")

  // Fetch post based on displayId or raw id depending on what is passed
  // Wait, the edit button pushes `postId` (the CUID) or `displayId`?
  // Let's check PostOptionsMenu.tsx. It pushes `postId`. 
  // It's safer to check by id first, if not found, check displayId.
  let post = await prisma.post.findUnique({
    where: { id },
    include: { media: true, poll: { include: { options: true } } }
  })

  if (!post) {
    post = await prisma.post.findUnique({
      where: { displayId: id },
      include: { media: true, poll: { include: { options: true } } }
    })
  }

  if (!post) notFound()

  if (post.status === "TAKEDOWN") {
    redirect(`/post/${post.displayId}`)
  }

  // Only author can edit
  if (post.authorId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER") {
    redirect("/")
  }

  const categories = await prisma.category.findMany({
    orderBy: { orderIndex: "asc" }
  })

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <span className="text-teal-500">Chỉnh sửa bài viết:</span> 
        <span className="truncate max-w-md text-slate-700 dark:text-slate-300" title={post.title}>{post.title}</span>
      </h1>
      
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <EditPostForm post={post} categories={categories} />
      </div>
    </div>
  )
}
