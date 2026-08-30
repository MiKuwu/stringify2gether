"use client"
import { useState } from "react"
import { resolveReport, takedownReportTarget } from "./actions"
import toast from "react-hot-toast"

export default function ReportsAdminClient({ reports }: { reports: any[] }) {
  const [takedownReport, setTakedownReport] = useState<any>(null)
  const [reason, setReason] = useState("")
  const [message, setMessage] = useState("")

  async function handleResolve(reportId: string, deletePost: boolean) {
    if (deletePost && !confirm("Bài viết/Bình luận sẽ bị xóa vĩnh viễn. Bạn chắc chứ?")) return
    const success = await resolveReport(reportId, deletePost)
    if (success) {
      toast.success("Đã xử lý báo cáo!")
    }
  }

  async function handleTakedown(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim() || !message.trim()) return
    const success = await takedownReportTarget(takedownReport.id, reason, message)
    if (success) {
      toast.success("Đã gỡ bài viết/bình luận")
      setTakedownReport(null)
      setReason("")
      setMessage("")
    }
  }

  if (reports.length === 0) {
    return <p className="text-slate-600 dark:text-slate-400">Không có báo cáo nào đang chờ xử lý.</p>
  }

  return (
    <div className="space-y-6">
      {reports.map(report => (
        <div key={report.id} className="bg-slate-100 dark:bg-slate-800 p-6 rounded border border-slate-300 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Người báo cáo: <strong className="text-teal-400">{report.reporter.username || "Ẩn danh"}</strong> 
                {" - "} {new Date(report.createdAt).toLocaleString("vi-VN")}
              </p>
              <div className="text-lg font-bold text-orange-400">Lý do: {report.reason}</div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-4 rounded mb-4">
            {report.commentId ? (
              <>
                <p className="text-sm text-slate-500 mb-1">Bình luận bị báo cáo:</p>
                {report.comment ? (
                  <>
                    <div className="font-bold text-slate-800 dark:text-slate-200">"{report.comment.content}"</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">Bởi: {report.comment.author.username} | Bài viết: {report.comment.post?.title}</div>
                  </>
                ) : (
                  <div className="text-red-400 italic">Bình luận này đã bị xóa.</div>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-slate-500 mb-1">Bài viết bị báo cáo:</p>
                {report.post ? (
                  <>
                    <div className="font-bold">{report.post.title}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Custom ID: {report.post.displayId}</div>
                  </>
                ) : (
                  <div className="text-red-400 italic">Bài viết này đã bị xóa.</div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            {report.post && !report.commentId && (
              <a href={`/post/${report.post.displayId}`} target="_blank" rel="noreferrer" className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-white font-medium">
                Xem bài viết
              </a>
            )}
            {report.commentId && report.comment?.post && (
              <a href={`/post/${report.comment.post.displayId}`} target="_blank" rel="noreferrer" className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-white font-medium">
                Xem bài viết chứa bình luận
              </a>
            )}
            
            <button onClick={() => handleResolve(report.id, false)} className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded text-white font-bold ml-auto">
              Đánh dấu Đã xử lý (Bỏ qua)
            </button>
            
            {(report.post || report.comment) && (
              <button 
                onClick={() => setTakedownReport(report)}
                className="bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded text-white font-bold"
              >
                Gỡ (Takedown)
              </button>
            )}
            
            {(report.post || report.comment) && (
              <button onClick={() => handleResolve(report.id, true)} className="bg-red-900 hover:bg-red-800 px-4 py-2 rounded text-white font-bold">
                Xóa vĩnh viễn
              </button>
            )}
          </div>
        </div>
      ))}

      {takedownReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-orange-500 mb-4">Gỡ {takedownReport.commentId ? "Bình luận" : "Bài viết"}</h3>
            <form onSubmit={handleTakedown} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">Lý do nội bộ (Admin xem)</label>
                <textarea 
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-3 text-white text-sm"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">Thông điệp gửi tác giả</label>
                <textarea 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-3 text-white text-sm"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setTakedownReport(null)}
                  className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-white rounded font-bold"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-500 text-white rounded font-bold"
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
