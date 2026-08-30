"use client"
import { useState } from "react"
import { updateFeedbackSettings, resolveSuggestion, deleteSuggestion } from "@/app/actions/feedback"
import toast from "react-hot-toast"
import { MailOpen, Trash2, CheckCircle, Mail, Settings, Image as ImageIcon, Save, X } from "lucide-react"

export default function AdminSuggestionsClient({ initialSuggestions, initialMessage, initialIcon }: { initialSuggestions: any[], initialMessage: string, initialIcon: string }) {
  const [suggestions, setSuggestions] = useState(initialSuggestions)
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null)
  const [message, setMessage] = useState(initialMessage)
  const [iconUrl, setIconUrl] = useState(initialIcon)
  const [isSaving, setIsSaving] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    const success = await updateFeedbackSettings(message, iconUrl)
    if (success) {
      toast.success("Đã lưu cài đặt hòm thư")
      setShowSettings(false)
    } else {
      toast.error("Lỗi khi lưu cài đặt")
    }
    setIsSaving(false)
  }

  async function handleResolve(id: string) {
    const success = await resolveSuggestion(id, "RESOLVED")
    if (success) {
      toast.success("Đã đánh dấu hoàn tất")
      setSuggestions(suggestions.map(s => s.id === id ? { ...s, status: "RESOLVED" } : s))
      if (selectedSuggestion?.id === id) {
        setSelectedSuggestion({ ...selectedSuggestion, status: "RESOLVED" })
      }
    } else {
      toast.error("Có lỗi xảy ra")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa kiến nghị này?")) return
    const success = await deleteSuggestion(id)
    if (success) {
      toast.success("Đã xóa kiến nghị")
      setSuggestions(suggestions.filter(s => s.id !== id))
      if (selectedSuggestion?.id === id) {
        setSelectedSuggestion(null)
      }
    } else {
      toast.error("Có lỗi xảy ra")
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MailOpen className="text-teal-500" /> Hòm Kiến Nghị
        </h1>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors"
        >
          <Settings size={18} /> Cài đặt hòm thư
        </button>
      </div>

      {showSettings && (
        <form onSubmit={handleSaveSettings} className="mb-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm">
          <h2 className="font-bold text-lg border-b border-slate-200 dark:border-slate-800 pb-2">Tùy chỉnh form Góp ý</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Câu dẫn "Gửi ý kiến..."
              </label>
              <textarea 
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="VD: Gửi ý kiến hoặc báo cáo lỗi..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Link Icon Hòm thư (tùy chọn)
              </label>
              <div className="flex gap-2 items-start">
                <input 
                  type="text" 
                  value={iconUrl}
                  onChange={e => setIconUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                />
                {iconUrl && (
                  <img src={iconUrl} alt="Icon preview" className="w-10 h-10 object-contain bg-slate-100 dark:bg-slate-800 rounded p-1" />
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              <Save size={18} /> {isSaving ? "Đang lưu..." : "Lưu cài đặt"}
            </button>
          </div>
        </form>
      )}

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {/* List */}
        <div className="col-span-1 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold">
            Thư đến ({suggestions.length})
          </div>
          <div className="flex-1 overflow-y-auto">
            {suggestions.length === 0 ? (
              <p className="p-4 text-slate-500 text-sm">Chưa có kiến nghị nào.</p>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {suggestions.map(s => (
                  <li key={s.id}>
                    <button 
                      onClick={() => setSelectedSuggestion(s)}
                      className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedSuggestion?.id === s.id ? "bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-500" : "border-l-4 border-transparent"}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm truncate pr-2">
                          {s.author ? s.author.username : "Người dùng ẩn danh"}
                        </span>
                        <span className="text-xs text-slate-500 shrink-0">
                          {new Date(s.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {s.content}
                      </p>
                      <div className="mt-2 flex gap-2">
                        {s.status === "PENDING" ? (
                          <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Đang chờ</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Đã giải quyết</span>
                        )}
                        {s.images && JSON.parse(s.images).length > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Có đính kèm</span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="col-span-1 md:col-span-2 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 flex flex-col h-[600px]">
          {selectedSuggestion ? (
            <>
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center font-bold text-slate-500">
                    {selectedSuggestion.author?.image ? (
                      <img src={selectedSuggestion.author.image} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Mail />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedSuggestion.author?.username || "Người dùng ẩn danh"}</h3>
                    <p className="text-xs text-slate-500">{new Date(selectedSuggestion.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedSuggestion.status === "PENDING" && (
                    <button 
                      onClick={() => handleResolve(selectedSuggestion.id)}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded text-sm transition-colors"
                    >
                      <CheckCircle size={16} /> Đã xem / Hoàn tất
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(selectedSuggestion.id)}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded text-sm transition-colors"
                  >
                    <Trash2 size={16} /> Xóa
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="prose dark:prose-invert max-w-none">
                  <h3 className="text-xl font-bold mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Nội dung thư:</h3>
                  <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                    {selectedSuggestion.content}
                  </p>
                </div>
                
                {selectedSuggestion.images && JSON.parse(selectedSuggestion.images).length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-bold text-sm mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">Tệp đính kèm:</h4>
                    <div className="flex flex-wrap gap-4">
                      {JSON.parse(selectedSuggestion.images).map((url: string, i: number) => (
                        <button 
                          key={i} 
                          onClick={() => setPreviewImage(url)} 
                          className="block w-48 h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:opacity-80 transition hover:ring-2 ring-teal-500"
                        >
                          <img src={url} alt={`Attachment ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MailOpen size={48} className="mb-4 opacity-50" />
              <p>Chọn một bức thư để đọc</p>
            </div>
          )}
        </div>
      </div>

      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-red-500 transition-colors bg-black/50 p-2 rounded-full"
            onClick={() => setPreviewImage(null)}
          >
            <X size={24} />
          </button>
          <img 
            src={previewImage} 
            alt="Preview Fullscreen" 
            className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl cursor-default"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
