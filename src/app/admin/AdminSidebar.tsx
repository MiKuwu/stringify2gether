"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminSidebar({
  pendingSuggestions = 0,
  pendingAppeals = 0,
  pendingReports = 0
}: {
  pendingSuggestions?: number,
  pendingAppeals?: number,
  pendingReports?: number
}) {
  const pathname = usePathname()

  const navs = [
    { href: "/admin", label: "Cài đặt chung", exact: true },
    { href: "/admin/categories", label: "Quản lý chuyên mục" },
    { href: "/admin/users", label: "Quản lý thành viên" },
    { href: "/admin/posts", label: "Quản lý bài viết" },
    { href: "/admin/reports", label: "Hòm báo cáo", badge: pendingReports },
    { href: "/admin/suggestions", label: "Hòm kiến nghị", badge: pendingSuggestions },
    { href: "/admin/staff", label: "Danh sách Ban Quản trị" },
    { href: "/admin/rules", label: "Nội quy cộng đồng" },
    { href: "/admin/appeals", label: "Đơn kháng nghị", badge: pendingAppeals },
    { href: "/admin/punishments", label: "Nhật ký xử phạt" },
    { href: "/admin/changelog", label: "Nhật ký ChangeLog" },
  ]

  return (
    <aside className="w-64 flex flex-col gap-2 shrink-0">
      <h2 className="text-xl font-bold mb-4">Quản trị viên</h2>
      <nav className="flex flex-col gap-2">
        {navs.map(nav => {
          const isActive = nav.exact ? pathname === nav.href : pathname.startsWith(nav.href)
          return (
            <Link 
              key={nav.href} 
              href={nav.href} 
              className={`flex items-center justify-between px-4 py-3 rounded font-medium transition-colors border-l-4 ${
                isActive 
                  ? "bg-teal-900/40 text-teal-400 border-teal-500 shadow-sm" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:bg-slate-700 hover:text-white"
              }`}
            >
              <span>{nav.label}</span>
              {!!nav.badge && nav.badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {nav.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
