"use client"
import { Copy } from "lucide-react"
import toast from "react-hot-toast"

export default function CopyButton({ text, label = "Copy" }: { text: string, label?: string }) {
  return (
    <button 
      onClick={() => {
        navigator.clipboard.writeText(text)
        toast.success(`Đã copy ${label}!`)
      }}
      className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-teal-400 transition ml-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-sm"
      title={`Copy ${label}`}
    >
      <Copy size={14} />
      <span className="hidden sm:inline">Copy</span>
    </button>
  )
}
