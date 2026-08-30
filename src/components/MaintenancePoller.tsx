"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Wrench } from "lucide-react"

interface MaintenanceData {
  maintenance: boolean
  title?: string | null
  message?: string | null
  imageUrl?: string | null
}

export default function MaintenancePoller() {
  const { data: session, status } = useSession()
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceData | null>(null)
  const [checked, setChecked] = useState(false)

  const isImmune = session?.user?.role === "ADMIN" || session?.user?.role === "ADMIN + FOUNDER"

  const checkMaintenance = async () => {
    try {
      const res = await fetch("/api/settings/maintenance", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setMaintenanceData(data)
      }
    } catch {
      // ignore
    } finally {
      setChecked(true)
    }
  }

  useEffect(() => {
    // Wait until session is resolved before checking
    if (status === "loading") return
    checkMaintenance()
    const interval = setInterval(checkMaintenance, 15000)
    return () => clearInterval(interval)
  }, [status])

  // Not yet checked, or session still loading — don't flash maintenance screen
  if (!checked || status === "loading") return null

  // Admin is immune
  if (isImmune) return null

  // Not in maintenance
  if (!maintenanceData?.maintenance) return null

  // Show maintenance screen
  const { title, message, imageUrl } = maintenanceData
  return (
    <div className="fixed inset-0 z-[99999] min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 text-center">
      <div className="absolute top-4 right-4">
        {session ? (
          <a href="/api/auth/signout" className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-300 transition">Đăng xuất</a>
        ) : (
          <a href="/api/auth/signin" className="text-sm text-slate-500 hover:text-teal-400 transition">Đăng nhập Admin</a>
        )}
      </div>
      {imageUrl ? (
        <img src={imageUrl} alt="Maintenance" className="max-w-md w-full rounded-lg mb-8 shadow-2xl object-cover border border-slate-200 dark:border-slate-800" />
      ) : (
        <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-teal-500 mb-8 animate-pulse shadow-lg border border-slate-200 dark:border-slate-800">
          <Wrench size={48} />
        </div>
      )}
      <h1 className="text-4xl font-black mb-6 text-teal-400 drop-shadow-md">{title || "Website Đang Bảo Trì"}</h1>
      <p className="text-xl text-slate-700 dark:text-slate-300 max-w-xl mx-auto leading-relaxed whitespace-pre-wrap">
        {message || "Chúng tôi đang tiến hành nâng cấp hệ thống để mang lại trải nghiệm tốt hơn. Vui lòng quay lại sau ít phút nhé!"}
      </p>
    </div>
  )
}