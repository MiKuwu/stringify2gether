"use client"
import { useState, useRef, useEffect } from "react"
import { MoreVertical, Copy, Edit2, Bookmark, Trash2, Flag, BellOff, Bell } from "lucide-react"
import toast from "react-hot-toast"
import { deletePost, addReport, toggleSavePost, toggleMutePost } from "./actions"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import ReportModal from "@/components/ReportModal"

export default function PostOptionsMenu({
  postId,
  displayId,
  isAuthor,
  canDelete,
  initialSaved,
  initialMuted
}: {
  postId: string
  displayId: string
  isAuthor: boolean
  canDelete: boolean
  initialSaved: boolean
  initialMuted?: boolean
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [saved, setSaved] = useState(initialSaved)
  const [muted, setMuted] = useState(initialMuted || false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleCopy() {
    navigator.clipboard.writeText(displayId)
    toast.success("Đã copy ID Bài viết!")
    setIsOpen(false)
  }

  function handleEdit() {
    router.push(`/edit/${postId}`)
    setIsOpen(false)
  }

  async function handleSave() {
    if (!session) {
      const { useAuthPromptStore } = require("@/lib/store")
      useAuthPromptStore.getState().openPrompt("Vui lòng đăng nhập để lưu bài viết.")
      return
    }
    setSaved(!saved)
    await toggleSavePost(postId)
    toast.success(saved ? "Đã bỏ lưu bài viết!" : "Đã lưu bài viết!")
    setIsOpen(false)
  }

  async function handleMute() {
    if (!session) {
      const { useAuthPromptStore } = require("@/lib/store")
      useAuthPromptStore.getState().openPrompt("Vui lòng đăng nhập để tắt thông báo.")
      return
    }
    setMuted(!muted)
    await toggleMutePost(postId)
    toast.success(muted ? "Đã bật lại thông báo cho bài viết này!" : "Đã tắt thông báo cho bài viết này!")
    setIsOpen(false)
  }

  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  async function handleReport() {
    if (!session) {
      const { useAuthPromptStore } = require("@/lib/store")
      useAuthPromptStore.getState().openPrompt("Vui lòng đăng nhập để báo cáo bài viết.")
      return
    }
    setIsOpen(false)
    setIsReportModalOpen(true)
  }

  async function handleDelete() {
    setIsOpen(false)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:bg-slate-800 flex items-center justify-center rounded-full text-slate-700 dark:text-slate-300 hover:text-white transition-colors"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
          <div className="py-1">
            <button onClick={handleCopy} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors">
              <Copy size={18} /> Copy ID
            </button>
            
            {isAuthor && (
              <button onClick={handleEdit} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors">
                <Edit2 size={18} /> Chỉnh sửa bài viết
              </button>
            )}

            {!isAuthor && (
              <button onClick={handleSave} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors">
                <Bookmark size={18} fill={saved ? "currentColor" : "none"} className={saved ? "text-teal-400" : ""} /> {saved ? "Bỏ lưu bài viết" : "Lưu bài viết"}
              </button>
            )}

            <button onClick={handleMute} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors">
              {muted ? (
                <><Bell size={18} /> Bật thông báo</>
              ) : (
                <><BellOff size={18} /> Tắt thông báo</>
              )}
            </button>

            <button onClick={handleReport} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-100 dark:bg-slate-800 text-orange-400 transition-colors">
              <Flag size={18} /> Báo cáo bài viết
            </button>

            {canDelete && (
              <button onClick={handleDelete} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-red-900/40 text-red-400 transition-colors border-t border-slate-200 dark:border-slate-800">
                <Trash2 size={18} /> {isAuthor ? "Xóa bài viết" : "Gỡ bài viết"}
              </button>
            )}
          </div>
        </div>
      )}
      
      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        postId={postId} 
      />

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {isAuthor ? "Xóa bài viết?" : "Gỡ bài viết (Takedown)"}
              </h3>
              
              {isAuthor ? (
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác và mọi dữ liệu liên quan sẽ bị xóa vĩnh viễn.
                </p>
              ) : (
                <div className="space-y-4 mt-4">
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Bài viết sẽ bị ẩn khỏi cộng đồng và chuyển sang trạng thái chờ kháng nghị.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lý do gỡ (Nội bộ Admin)</label>
                    <textarea 
                      id="takedownReason"
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-600 rounded p-2 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                      placeholder="Ghi rõ lý do..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lời nhắn đến tác giả</label>
                    <textarea 
                      id="takedownMessage"
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-600 rounded p-2 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                      placeholder="Giải thích cho người dùng..."
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-800/50 flex gap-3 justify-end border-t border-slate-300 dark:border-slate-700">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:bg-slate-700 rounded transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={async () => {
                  if (isAuthor) {
                    setIsDeleteModalOpen(false)
                    await deletePost(postId)
                    toast.success("Đã xóa bài viết!")
                  } else {
                    const reason = (document.getElementById("takedownReason") as HTMLTextAreaElement).value
                    const message = (document.getElementById("takedownMessage") as HTMLTextAreaElement).value
                    if (!reason || !message) {
                      toast.error("Vui lòng điền đủ lý do và lời nhắn")
                      return
                    }
                    setIsDeleteModalOpen(false)
                    const { takedownPost } = await import("./actions")
                    await takedownPost(postId, reason, message)
                    toast.success("Đã gỡ bài viết!")
                  }
                }}
                className="px-4 py-2 font-bold text-white bg-red-600 hover:bg-red-500 rounded transition-colors shadow-lg shadow-red-900/20"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
