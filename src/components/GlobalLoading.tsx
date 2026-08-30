"use client"
import { useLoadingStore } from "@/lib/store"

export default function GlobalLoading({ imageUrl }: { imageUrl?: string }) {
  const isLoading = useLoadingStore(state => state.isLoading)

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950/80 z-[9999] flex flex-col items-center justify-center backdrop-blur-sm px-4">
      <div className="relative animate-bounce">
        <img 
          src={imageUrl || "https://i.postimg.cc/MZLYY3mf/Chat-GPT-Image-15-05-11-21-thg-8-2026.png"} 
          alt="Loading..." 
          className="w-40 h-40 object-contain drop-shadow-2xl"
        />
        <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-xl animate-pulse -z-10"></div>
      </div>
      <p className="mt-6 text-teal-400 font-bold animate-pulse text-lg tracking-widest drop-shadow-lg">
        ĐANG XỬ LÝ...
      </p>
    </div>
  )
}
