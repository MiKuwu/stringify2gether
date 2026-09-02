import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { addCategory } from "./actions"
import CategoryClientList from "./CategoryClientList"

export default async function AdminCategories() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) {
    redirect("/")
  }

  const categories = await prisma.category.findMany({
    orderBy: { orderIndex: 'asc' }
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý chuyên mục</h1>
      
      <div className="mb-8 p-4 bg-slate-100 dark:bg-slate-800 rounded">
        <h2 className="text-lg font-semibold mb-4">Thêm chuyên mục mới</h2>
        <form action={addCategory} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300">Tên chuyên mục</label>
            <input type="text" name="name" required className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-white rounded p-2" placeholder="VD: Giáo án Outbreak" />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300">Đường dẫn tĩnh (Slug)</label>
            <input type="text" name="slug" required className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-white rounded p-2" placeholder="VD: outbreak" />
          </div>
          <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded font-medium h-[42px]">Thêm</button>
        </form>
      </div>

      <CategoryClientList initialCategories={categories} />
    </div>
  )
}
