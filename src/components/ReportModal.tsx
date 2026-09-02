"use client"
import { useState } from "react"
import toast from "react-hot-toast"
import { addReport, addReportComment } from "@/app/post/[id]/actions"

export default function ReportModal({
  isOpen,
  onClose,
  postId,
  commentId
}: {
  isOpen: boolean
  onClose: () => void
  postId?: string
  commentId?: string
}) {
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) return

    setLoading(true)
    if (commentId) {
      await addReportComment(commentId, reason)
    } else if (postId) {
      await addReport(postId, reason)
    }
    toast.success("Đã gửi báo cáo vi phạm thành công!")
    setLoading(false)
    setReason("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Báo cáo vi phạm</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Vui lòng nhập chi tiết lý do bạn muốn báo cáo {commentId ? "bình luận" : "bài viết"} này. Admin sẽ xem xét và xử lý.
        </p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            required
            autoFocus
            rows={4}
            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-lg focus:outline-none focus:border-teal-500 mb-6 resize-none"
            placeholder="Nội dung vi phạm, spam, ngôn từ kích động..."
          ></textarea>
          
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="px-5 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Đang gửi..." : "Gửi Báo Cáo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
