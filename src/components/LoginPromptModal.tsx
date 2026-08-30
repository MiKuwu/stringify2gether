"use client"
import { useAuthPromptStore } from "@/lib/store"
import { signIn } from "next-auth/react"
import { X, LogIn } from "lucide-react"

export default function LoginPromptModal({ iconUrl, defaultMessage }: { iconUrl?: string, defaultMessage?: string }) {
  const { isOpen, closePrompt } = useAuthPromptStore()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300 ease-out">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden relative animate-in fade-in zoom-in-50 slide-in-from-bottom-8 duration-500"
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <button 
          onClick={closePrompt}
          className="absolute top-4 right-4 text-slate-600 dark:text-slate-400 hover:text-white transition-transform hover:rotate-90 hover:scale-110 duration-300"
        >
          <X size={20} />
        </button>
        
        <div className="p-6 text-center">
          {iconUrl ? (
            <img src={iconUrl} alt="Login Icon" className="w-16 h-16 object-contain mx-auto mb-4 animate-bounce" style={{ animationDuration: '3s' }} />
          ) : (
            <div className="w-16 h-16 bg-teal-500/20 text-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <LogIn size={32} />
            </div>
          )}
          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
            Yêu cầu Đăng nhập
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
            {defaultMessage || "Vui lòng đăng nhập để trải nghiệm đầy đủ các tính năng như đăng bài, bình luận, và theo dõi người dùng khác."}
          </p>
          
          <button 
            onClick={() => signIn("google")}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3.5 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(13,148,136,0.4)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            Đăng nhập với Google
          </button>
        </div>
      </div>
    </div>
  )
}
