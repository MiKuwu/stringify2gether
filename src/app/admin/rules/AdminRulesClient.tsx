"use client"
import { useState } from "react"
import toast from "react-hot-toast"
import dynamic from "next/dynamic"
import "react-quill-new/dist/quill.snow.css"
import { saveRules } from "./actions"
import { useLoadingStore } from "@/lib/store"

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })

export default function AdminRulesClient({ initialContent }: { initialContent: string }) {
  const [content, setContent] = useState(initialContent)
  const setLoading = useLoadingStore(state => state.setLoading)

  async function handleSave() {
    setLoading(true)
    const res = await saveRules(content)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Đã lưu Nội quy cộng đồng!")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-teal-400 uppercase tracking-widest drop-shadow-md">Nội Quy Cộng Đồng</h1>
        <button 
          onClick={handleSave}
          className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-6 rounded transition-colors"
        >
          Lưu thay đổi
        </button>
      </div>
      
      <p className="text-slate-600 dark:text-slate-400">Nội dung này sẽ hiển thị khi người dùng bấm vào nút "Nội quy cộng đồng" ở trang chủ.</p>

      <div className="bg-white text-black rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
        <ReactQuill 
          theme="snow" 
          value={content} 
          onChange={setContent} 
          className="h-[500px] mb-12"
          modules={{
            toolbar: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike', 'blockquote'],
              [{ 'align': [] }],
              [{ 'color': [] }, { 'background': [] }],
              [{'list': 'ordered'}, {'list': 'bullet'}],
              ['link', 'clean']
            ],
          }}
        />
      </div>
    </div>
  )
}
