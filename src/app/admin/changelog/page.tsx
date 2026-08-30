import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Admin ChangeLog",
}

export default async function AdminChangeLogPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) {
    redirect("/")
  }

  const logs = await prisma.adminLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      admin: {
        select: { name: true, username: true, image: true, role: true }
      }
    },
    take: 100
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-teal-400 uppercase tracking-widest drop-shadow-md">Nhật Ký ChangeLog</h1>
      <p className="text-slate-600 dark:text-slate-400">Ghi lại 100 hành động gần nhất của ban quản trị (Admins).</p>

      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto border border-slate-300 dark:border-slate-700">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700">
              <th className="p-4 text-slate-700 dark:text-slate-300 font-semibold w-48">Thời gian</th>
              <th className="p-4 text-slate-700 dark:text-slate-300 font-semibold w-48">Admin</th>
              <th className="p-4 text-slate-700 dark:text-slate-300 font-semibold w-48">Hành động</th>
              <th className="p-4 text-slate-700 dark:text-slate-300 font-semibold">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => {
              const displayName = log.admin.username || "Người dùng ẩn danh"
              return (
              <tr key={log.id} className="border-b border-slate-300 dark:border-slate-700/50 hover:bg-slate-200 dark:bg-slate-700/30 transition">
                <td className="p-4 text-slate-600 dark:text-slate-400 text-sm whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {log.admin.image ? (
                      <img src={log.admin.image} alt={displayName} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold uppercase">
                        {displayName.charAt(0)}
                      </div>
                    )}
                    <span className="font-medium text-slate-800 dark:text-slate-200">{displayName}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-mono">
                    {log.action}
                  </span>
                </td>
                <td className="p-4 text-slate-700 dark:text-slate-300">
                  {log.details}
                </td>
              </tr>
              )
            })}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  Chưa có nhật ký nào được ghi lại.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
