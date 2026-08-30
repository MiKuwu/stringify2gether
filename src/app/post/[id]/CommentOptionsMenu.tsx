"use client"
import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2, Flag, ShieldAlert } from "lucide-react"
import toast from "react-hot-toast"
import { deleteComment, takedownComment } from "./actions"
import ReportModal from "@/components/ReportModal"

export default function CommentOptionsMenu({ 
  commentId, 
  isAuthor,
  myRole,
  authorRole,
  onEdit
}: { 
  commentId: string
  isAuthor: boolean
  myRole?: string
  authorRole: string
  onEdit: () => void
}) {
  const [open, setOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)

  // Takedown state
  const [isTakedownModalOpen, setIsTakedownModalOpen] = useState(false)
  const [takedownReason, setTakedownReason] = useState("")
  const [takedownMessage, setTakedownMessage] = useState("")
  
  let canTakedown = false
  if (!isAuthor && myRole) {
    if (myRole === "ADMIN + FOUNDER") {
      canTakedown = true
    } else if (myRole === "ADMIN" && authorRole === "USER") {
      canTakedown = true
    }
  }

  async function handleDelete() {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return
    await deleteComment(commentId)
    toast.success("Đã xóa bình luận")
    setOpen(false)
  }

  async function handleTakedown(e: React.FormEvent) {
    e.preventDefault()
    if (!takedownReason.trim() || !takedownMessage.trim()) {
      toast.error("Vui lòng nhập đầy đủ lý do và thông điệp.")
      return
    }
    await takedownComment(commentId, takedownReason, takedownMessage)
    toast.success("Đã gỡ bình luận")
    setIsTakedownModalOpen(false)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="p-1 text-slate-500 hover:text-teal-400 hover:bg-slate-100 dark:bg-slate-800 rounded transition"
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
          {isAuthor && (
            <button 
              onClick={() => { setOpen(false); onEdit(); }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:bg-slate-700 hover:text-white flex items-center gap-2"
            >
              <Pencil size={16} /> Chỉnh sửa
            </button>
          )}
          {isAuthor && (
            <button 
              onClick={handleDelete}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-200 dark:bg-slate-700 hover:text-red-300 flex items-center gap-2"
            >
              <Trash2 size={16} /> Xóa bình luận
            </button>
          )}
          {!isAuthor && canTakedown && (
            <button 
              onClick={() => { setOpen(false); setIsTakedownModalOpen(true); }}
              className="w-full text-left px-4 py-2 text-sm text-orange-400 hover:bg-slate-200 dark:bg-slate-700 hover:text-orange-300 flex items-center gap-2 border-t border-slate-300 dark:border-slate-700"
            >
              <ShieldAlert size={16} /> Gỡ bình luận (Admin)
            </button>
          )}
          {!isAuthor && (
            <button 
              onClick={() => { setOpen(false); setReportModalOpen(true); }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:bg-slate-700 hover:text-white flex items-center gap-2"
            >
              <Flag size={16} /> Báo cáo
            </button>
          )}
        </div>
      )}

      {/* Report Modal */}
      <ReportModal 
        isOpen={reportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
        commentId={commentId}
      />

      {/* Takedown Modal */}
      {isTakedownModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-red-500 mb-4">Gỡ bình luận</h3>
            <form onSubmit={handleTakedown} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">Lý do nội bộ (Admin xem)</label>
                <textarea 
                  value={takedownReason}
                  onChange={e => setTakedownReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-3 text-white text-sm"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">Thông điệp gửi tác giả</label>
                <textarea 
                  value={takedownMessage}
                  onChange={e => setTakedownMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-3 text-white text-sm"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsTakedownModalOpen(false)}
                  className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-white rounded font-bold"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded font-bold"
                >
                  Xác nhận Gỡ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}