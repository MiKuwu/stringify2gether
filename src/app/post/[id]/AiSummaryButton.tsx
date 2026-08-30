"use client"
import { useState } from "react"
import { summarizePost } from "./actions"
import toast from "react-hot-toast"
import { Sparkles, X } from "lucide-react"

export default function AiSummaryButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  async function handleSummarize() {
    if (summary) {
      setIsOpen(true)
      return
    }
    setLoading(true)
    const res = await summarizePost(postId)
    if (res.error) {
      toast.error(res.error)
    } else if (res.summary) {
      setSummary(res.summary)
      setIsOpen(true)
    }
    setLoading(false)
  }

  return (
    <>
      <button 
        onClick={handleSummarize}
        disabled={loading}
        className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-teal-900/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles size={16} />
        {loading ? "AI đang đọc..." : "Tóm tắt bằng AI"}
      </button>

      {isOpen && summary && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-teal-500/10 to-emerald-500/10">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="text-teal-500" /> Bản Tóm Tắt AI
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white transition">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="prose dark:prose-invert prose-sm max-w-none prose-ul:pl-4 prose-li:my-1 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {summary}
              </div>
              <p className="text-xs text-slate-500 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 italic">
                *Tóm tắt được tạo tự động bởi Google Gemini AI. Nội dung có thể không chính xác 100%.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
