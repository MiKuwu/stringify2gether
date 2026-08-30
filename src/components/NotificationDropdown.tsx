"use client"
import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLoadingStore } from "@/lib/store"

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  const isUploading = useLoadingStore(state => state.isUploading)
  const uploadProgress = useLoadingStore(state => state.uploadProgress)

  useEffect(() => {
    fetchNotifications()
    // Poll every 10s for more real-time feel
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function fetchNotifications() {
    const res = await fetch("/api/notifications")
    if (res.ok) {
      const data = await res.json()
      setNotifications(data)
    }
  }

  function markAllAsRead() {
    fetch("/api/notifications", { method: "PUT", body: JSON.stringify({}) })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  function handleClick(notif: any) {
    if (!notif.read) {
      fetch("/api/notifications", { 
        method: "PUT", 
        body: JSON.stringify({ id: notif.id }) 
      })
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))
    }
    setIsOpen(false)
    if (notif.post) {
      router.push(`/post/${notif.post.displayId}`)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-700 dark:text-slate-300 hover:text-white transition-colors"
      >
        <Bell size={20} />
        {(unreadCount > 0 || isUploading) && (
          <span className={`absolute top-0 right-0 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${isUploading ? 'bg-teal-500 animate-pulse' : 'bg-red-500'}`}>
            {isUploading ? '↑' : (unreadCount > 9 ? '9+' : unreadCount)}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute -left-2 md:left-auto md:right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
          <div className="p-3 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-bold text-white">Thông báo</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-teal-400 hover:text-teal-300">
                Đánh dấu tất cả là đã đọc
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isUploading && (
              <div className="p-3 border-b border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 flex flex-col gap-2 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-teal-500 border-t-transparent animate-spin"></div>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Bài viết đang được tải lên... {uploadProgress}%</span>
                </div>
                <div className="w-full bg-white dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}
            
            {notifications.length === 0 && !isUploading ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                Chưa có thông báo nào.
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => handleClick(n)}
                  className={`p-3 border-b border-slate-200 dark:border-slate-800/50 cursor-pointer transition-colors flex gap-3 items-start ${n.read ? 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden">
                    {n.actor.image ? (
                      <img src={n.actor.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 text-xs">
                        {n.actor.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-white">{n.actor.username || "Ai đó"}</span>
                      {n.type === "REPLY" && " đã trả lời bình luận của bạn."}
                      {n.type === "UPVOTE" && " đã upvote bình luận của bạn."}
                      {n.type === "DOWNVOTE" && " đã downvote bình luận của bạn."}
                      {n.type === "LIKE" && " đã thích bài viết của bạn."}
                      {n.type === "TAKEDOWN" && " đã gỡ một bài viết của bạn vì vi phạm quy định."}
                      {n.type === "COMMENT_TAKEDOWN" && " đã gỡ một bình luận của bạn vì vi phạm quy định."}
                      {n.type === "NEW_POST" && " vừa đăng một bài viết mới."}
                    </p>
                    <p className="text-xs text-teal-400 mt-1 line-clamp-1">{n.post?.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
