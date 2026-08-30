"use client"
import { removeAdmin } from "../users/actions"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function StaffAdminClient({ staff, isFounder }: { staff: any[], isFounder: boolean }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleRemove(id: string) {
    if (!confirm("Bạn có chắc muốn gỡ quyền Admin của người này?")) return
    setLoadingId(id)
    const res = await removeAdmin(id)
    if (res.success) {
      toast.success("Đã gỡ quyền Admin thành công!")
      router.refresh()
    } else {
      toast.error(res.error || "Có lỗi xảy ra")
    }
    setLoadingId(null)
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700">
            <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Tên người dùng (Username)</th>
            <th className="p-4 font-bold text-slate-700 dark:text-slate-300">UID</th>
            <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Vai trò</th>
            <th className="p-4 font-bold text-slate-700 dark:text-slate-300 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300 dark:divide-slate-700/50">
          {staff.map(user => (
            <tr key={user.id} className="hover:bg-slate-200 dark:bg-slate-700/30 transition">
              <td className="p-4 font-medium text-white">{user.username || "Chưa thiết lập"}</td>
              <td className="p-4 text-teal-400 font-mono text-sm">{user.displayId}</td>
              <td className="p-4">
                {user.role === "ADMIN + FOUNDER" ? (
                  <span className="bg-red-900/40 text-red-400 border border-red-500/30 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                    Founder
                  </span>
                ) : (
                  <span className="bg-purple-900/40 text-purple-400 border border-purple-500/30 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </td>
              <td className="p-4 text-right">
                {isFounder && user.role === "ADMIN" && (
                  <button 
                    onClick={() => handleRemove(user.id)}
                    disabled={loadingId === user.id}
                    className="text-sm bg-red-900/50 hover:bg-red-800 text-red-400 hover:text-white px-3 py-1.5 rounded transition disabled:opacity-50 font-medium"
                  >
                    {loadingId === user.id ? "Đang xử lý..." : "Gỡ quyền"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
