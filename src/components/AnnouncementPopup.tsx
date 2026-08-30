"use client"
import { useState, useEffect } from "react"
import { X } from "lucide-react"

export default function AnnouncementPopup({ text, imageUrl }: { text: string, imageUrl?: string }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Show popup once per session
    const hasSeenPopup = sessionStorage.getItem("hasSeenPopup")
    if (!hasSeenPopup) {
      setIsOpen(true)
      sessionStorage.setItem("hasSeenPopup", "true")
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition"
        >
          <X size={20} />
        </button>
        
        {imageUrl && (
          <div className="w-full h-48 sm:h-64 relative bg-slate-100 dark:bg-slate-800">
            <img src={imageUrl} alt="Announcement" className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-teal-400 mb-4">Thông báo</h3>
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{text}</p>
          
          <div className="mt-8 flex justify-end">
            <button 
              onClick={() => setIsOpen(false)}
              className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2 rounded-full font-bold transition"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
