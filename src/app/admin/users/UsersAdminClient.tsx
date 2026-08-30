"use client"
import { useState } from "react"
import { findUserByCustomId, banUser, addAdmin, removeAdmin } from "./actions"

import toast from "react-hot-toast"

export default function UsersAdminClient({ isFounder }: { isFounder: boolean }) {
  const [searchId, setSearchId] = useState("")
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState("")

  const [isBanModalOpen, setIsBanModalOpen] = useState(false)
  const [banHours, setBanHours] = useState(0)
  const [banReason, setBanReason] = useState("")
  const [banMessage, setBanMessage] = useState("")

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setUser(null)
    const result = await findUserByCustomId(searchId)
    if (result) {
      setUser(result)
    } else {
      setError("Không tìm thấy người dùng với ID này.")
    }
  }

  async function handleBan(hours: number) {
    if (!user) return
    const success = await banUser(user.id, hours, banReason, banMessage)
    if (success) {
      toast.success("Cập nhật thành công!")
      setIsBanModalOpen(false)
      setBanReason("")
      setBanMessage("")
      handleSearch({ preventDefault: () => {} } as any)
    }
  }

  async function confirmUnban() {
    if (!confirm("Xác nhận gỡ khóa cho người này?")) return
    handleBan(0)
  }

  async function handleAddAdmin() {
    if (!user) return
    if (!confirm("Cấp quyền Admin cho người này?")) return
    const res = await addAdmin(user.id)
    if (res.success) {
      toast.success("Đã cấp quyền Admin!")
      handleSearch({ preventDefault: () => {} } as any)
    } else {
      toast.error(res.error || "Có lỗi xảy ra")
    }
  }

  async function handleRemoveAdmin() {
    if (!user) return
    if (!confirm("Thu hồi quyền Admin của người này?")) return
    const res = await removeAdmin(user.id)
    if (res.success) {
      toast.success("Đã gỡ quyền Admin!")
      handleSearch({ preventDefault: () => {} } as any)
    } else {
      toast.error(res.error || "Có lỗi xảy ra")
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-4 mb-8">
        <input 
          type="text" 
          placeholder="Nhập ID Người dùng (VD: VN000000001)"
          value={searchId}
          onChange={e => setSearchId(e.target.value)}
          className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-white p-3 rounded focus:outline-none focus:border-teal-500"
          required
        />
        <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded font-bold transition">
          Tìm kiếm
        </button>
      </form>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {user && (
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded border border-slate-300 dark:border-slate-700 space-y-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-teal-400">{user.username || "Chưa đặt tên"}</h3>
              <p className="text-slate-600 dark:text-slate-400">Vai trò: <span className="text-white font-bold">{user.role}</span></p>
              <p className="text-slate-600 dark:text-slate-400">
                Trạng thái: {user.bannedUntil ? (
                  new Date(user.bannedUntil).getFullYear() === 2099 ? (
                    <span className="text-red-400 font-bold">Khóa vĩnh viễn</span>
                  ) : (
                    <span className="text-orange-400 font-bold">Bị khóa đến {new Date(user.bannedUntil).toLocaleString("vi-VN")}</span>
                  )
                ) : (
                  <span className="text-green-400 font-bold">Bình thường</span>
                )}
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-300 dark:border-slate-700 pt-4">
            <h4 className="font-bold">Thao tác xử lý</h4>
            
            {(isFounder || user.role === "USER") ? (
              <>
                <div className="flex flex-wrap gap-2">
              <button onClick={() => { setBanHours(12); setIsBanModalOpen(true); }} className="bg-orange-900/50 hover:bg-orange-800 text-orange-400 px-4 py-2 rounded font-medium">Khóa 12h</button>
              <button onClick={() => { setBanHours(24); setIsBanModalOpen(true); }} className="bg-orange-900/50 hover:bg-orange-800 text-orange-400 px-4 py-2 rounded font-medium">Khóa 24h</button>
              <button onClick={() => { setBanHours(3 * 24); setIsBanModalOpen(true); }} className="bg-orange-900/50 hover:bg-orange-800 text-orange-400 px-4 py-2 rounded font-medium">Khóa 3 ngày</button>
              <button onClick={() => { setBanHours(7 * 24); setIsBanModalOpen(true); }} className="bg-orange-900/50 hover:bg-orange-800 text-orange-400 px-4 py-2 rounded font-medium">Khóa 7 ngày</button>
              <button onClick={() => { setBanHours(14 * 24); setIsBanModalOpen(true); }} className="bg-orange-900/50 hover:bg-orange-800 text-orange-400 px-4 py-2 rounded font-medium">Khóa 14 ngày</button>
              <button onClick={() => { setBanHours(30 * 24); setIsBanModalOpen(true); }} className="bg-orange-900/50 hover:bg-orange-800 text-orange-400 px-4 py-2 rounded font-medium">Khóa 30 ngày</button>
              <button onClick={() => { setBanHours(-1); setIsBanModalOpen(true); }} className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded font-bold">Khóa Vĩnh viễn</button>
            </div>
            
            <div className="pt-2">
              <button onClick={() => confirmUnban()} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-medium">Gỡ khóa (Unban)</button>
            </div>

            {isFounder && user.role !== "ADMIN" && user.role !== "ADMIN + FOUNDER" && (
              <div className="pt-4 mt-4 border-t border-slate-300 dark:border-slate-700">
                <button onClick={handleAddAdmin} className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded font-bold shadow-lg shadow-amber-900/20">
                  Cấp quyền Admin
                </button>
                <p className="text-xs text-slate-500 mt-2">Chỉ Founder mới thấy nút này.</p>
              </div>
            )}

            {isFounder && user.role === "ADMIN" && (
              <div className="pt-4 mt-4 border-t border-slate-300 dark:border-slate-700">
                <button onClick={handleRemoveAdmin} className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded font-bold shadow-lg shadow-red-900/20">
                  Thu hồi quyền Admin
                </button>
                <p className="text-xs text-slate-500 mt-2">Chỉ Founder mới thấy nút này.</p>
              </div>
            )}
              </>
            ) : (
              <p className="text-slate-500 text-sm italic">Bạn không có quyền khóa/gỡ khóa tài khoản có chức vụ ngang hàng hoặc cao hơn.</p>
            )}
          </div>
        </div>
      )}

      {isBanModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Khóa tài khoản</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lý do vi phạm (Nội bộ Admin)</label>
                  <textarea 
                    value={banReason}
                    onChange={e => setBanReason(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-600 rounded p-2 text-white focus:outline-none focus:border-orange-500"
                    placeholder="Ghi rõ lý do khóa (VD: Spam bình luận chửi thề...)"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lời nhắn đến User</label>
                  <textarea 
                    value={banMessage}
                    onChange={e => setBanMessage(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-600 rounded p-2 text-white focus:outline-none focus:border-orange-500"
                    placeholder="Thông báo cho User (VD: Tài khoản của bạn bị khóa vì vi phạm quy tắc cộng đồng...)"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-800/50 flex gap-3 justify-end border-t border-slate-300 dark:border-slate-700">
              <button 
                onClick={() => setIsBanModalOpen(false)}
                className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-200 dark:bg-slate-700 rounded transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={() => handleBan(banHours)}
                className="px-4 py-2 font-bold text-white bg-orange-600 hover:bg-orange-500 rounded transition-colors"
              >
                Xác nhận Khóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
