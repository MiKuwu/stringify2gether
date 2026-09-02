"use client"
import { useState } from "react"
import toast from "react-hot-toast"
import { voteAppeal, resolveAppeal } from "./actions"
import Link from "next/link"

export default function AppealsAdminClient({ 
  appeal, 
  currentAdminId,
  isFounder,
  totalAdminsCount
}: { 
  appeal: any
  currentAdminId: string
  isFounder: boolean
  totalAdminsCount: number
}) {
  const [voting, setVoting] = useState(false)
  
  const keepVotes = appeal.votes.filter((v: any) => v.vote === "KEEP")
  const deleteVotes = appeal.votes.filter((v: any) => v.vote === "DELETE")
  const unvotedCount = Math.max(0, totalAdminsCount - appeal.votes.length)
  
  const myVote = appeal.votes.find((v: any) => v.adminId === currentAdminId)

  async function handleVote(voteType: "KEEP" | "DELETE") {
    setVoting(true)
    const res = await voteAppeal(appeal.id, voteType)
    setVoting(false)
    if (res.success) {
      toast.success("Đã ghi nhận phiếu bầu!")
    } else {
      toast.error("Có lỗi xảy ra")
    }
  }

  async function handleResolve() {
    if (!confirm("Chốt kết quả đơn kháng nghị này? Hãy chắc chắn rằng đa số Admin đã bỏ phiếu.")) return
    setVoting(true)
    const res = await resolveAppeal(appeal.id)
    setVoting(false)
    if (res.success) {
      toast.success("Đã chốt kết quả thành công!")
    } else {
      toast.error(res.error || "Có lỗi xảy ra")
    }
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden flex flex-col">
      <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-300 dark:border-slate-700 flex justify-between items-center">
        <div className="font-bold text-orange-400">
          {appeal.type === "POST_TAKEDOWN" 
            ? "KHÁNG NGHỊ GỠ BÀI" 
            : appeal.type === "COMMENT_TAKEDOWN" 
              ? "KHÁNG NGHỊ GỠ BÌNH LUẬN" 
              : "KHÁNG NGHỊ KHÓA ACC"}
        </div>
        <div className="text-sm text-slate-500">
          {new Date(appeal.createdAt).toLocaleString("vi-VN")}
        </div>
      </div>
      
      <div className="p-6 space-y-6 flex-1">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Đối tượng: {appeal.targetData.url ? (
              <a href={appeal.targetData.url} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">
                {appeal.targetData.title}
              </a>
            ) : (
              <span className="text-teal-400">{appeal.targetData.title}</span>
            )}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Chủ sở hữu: {appeal.targetData.authorName}</p>
        </div>

        <div className="space-y-3">
          <div className="bg-red-950/20 border-l-4 border-red-500 p-3 rounded-r text-sm">
            <span className="font-bold text-red-400 block mb-1">Lý do từ Admin ban đầu:</span>
            <span className="text-slate-700 dark:text-slate-300">{appeal.targetData.adminReason || "(Không có lý do rõ ràng)"}</span>
          </div>

          <div className="bg-blue-950/20 border-l-4 border-blue-500 p-3 rounded-r text-sm">
            <span className="font-bold text-blue-400 block mb-1">Lời kháng nghị từ người dùng:</span>
            <span className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{appeal.reason}</span>
          </div>
        </div>

        <div className="border-t border-slate-300 dark:border-slate-700 pt-4">
          <h4 className="font-bold mb-3 text-sm text-slate-700 dark:text-slate-300 flex justify-between items-center">
            <span>Biểu quyết của Ban Quản Trị ({appeal.votes.length} phiếu)</span>
            <span className="text-xs font-normal text-slate-500">Chưa bầu: {unvotedCount}</span>
          </h4>
          <div className="flex gap-4">
            <div className="flex-1 bg-white dark:bg-slate-900 rounded p-3 text-center border border-green-900/50">
              <div className="text-green-500 font-bold mb-1">GIỮ LẠI (Tha)</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{keepVotes.length}</div>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-900 rounded p-3 text-center border border-red-900/50">
              <div className="text-red-500 font-bold mb-1">GỠ / KHÓA (Phạt)</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{deleteVotes.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/50 p-6 border-t border-slate-300 dark:border-slate-700 flex flex-col gap-3">
        <div className="flex gap-2">
          <button 
            disabled={voting}
            onClick={() => handleVote("KEEP")}
            className={`flex-1 py-2 rounded font-bold transition ${myVote?.vote === "KEEP" ? "bg-green-600 text-white ring-2 ring-green-300" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-600"}`}
          >
            Vote: Tha
          </button>
          <button 
            disabled={voting}
            onClick={() => handleVote("DELETE")}
            className={`flex-1 py-2 rounded font-bold transition ${myVote?.vote === "DELETE" ? "bg-red-600 text-white ring-2 ring-red-300" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-600"}`}
          >
            Vote: Phạt
          </button>
        </div>

        {isFounder ? (
          <button 
            disabled={voting}
            onClick={handleResolve}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded mt-2 shadow-lg shadow-orange-900/20"
          >
            Chốt kết quả đơn này
          </button>
        ) : (
          <p className="text-center text-xs text-slate-500 mt-2">Chỉ Founder mới có quyền chốt kết quả.</p>
        )}
      </div>
    </div>
  )
}
