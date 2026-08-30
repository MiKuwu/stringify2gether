import { Wrench } from "lucide-react"

export default function MaintenanceScreen({ 
  title,
  message, 
  imageUrl,
  isLoggedIn
}: { 
  title?: string | null,
  message?: string | null, 
  imageUrl?: string | null,
  isLoggedIn?: boolean
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 text-center relative">
      <div className="absolute top-4 right-4">
        {isLoggedIn ? (
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
