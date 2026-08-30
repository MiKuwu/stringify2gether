"use client"
import { useState } from "react"
import toast from "react-hot-toast"
import { submitAppeal } from "./actions"

export default function AppealForm({ type, targetId, alreadyAppealed }: { type: string, targetId: string, alreadyAppealed: boolean }) {
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(alreadyAppealed)

  if (done) {
    return (
      <div className="mt-8 bg-teal-900/30 border border-teal-900/50 p-4 rounded text-teal-400">
        <h4 className="font-bold mb-1">Đơn kháng nghị đang được xử lý</h4>
        <p className="text-sm">Vui lòng chờ Ban quản trị xét duyệt. Chúng tôi sẽ thông báo kết quả sớm nhất.</p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do kháng nghị")
      return
    }
    setSubmitting(true)
    const res = await submitAppeal(type, targetId, reason)
    setSubmitting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Đã gửi đơn kháng nghị thành công!")
      setDone(true)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 text-left border-t border-slate-300 dark:border-slate-700 pt-6">
      <h3 className="font-bold text-white mb-2 text-lg">Kháng nghị quyết định</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        {type === "USER_BAN" 
          ? "Bạn có 24 giờ kể từ lúc bị khóa để gửi đơn kháng nghị. Hãy giải thích rõ lý do vì sao quyết định của Ban quản trị là không chính xác." 
          : "Nếu bạn cho rằng quyết định gỡ nội dung này là không hợp lý, hãy gửi đơn kháng nghị để Ban quản trị xem xét lại."}
      </p>
      <textarea
        value={reason}
        onChange={e => setReason(e.target.value)}
        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-3 text-white focus:outline-none focus:border-orange-500 mb-3"
        rows={4}
        placeholder="Nhập lý do kháng nghị..."
      />
      <button 
        type="submit" 
        disabled={submitting}
        className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-6 rounded transition disabled:opacity-50"
      >
        {submitting ? "Đang gửi..." : "Gửi kháng nghị"}
      </button>
    </form>
  )
}
