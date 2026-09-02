"use client"
import { useState, useMemo } from "react"
import { Search, ChevronDown, ChevronUp, X } from "lucide-react"

type PunishedUser = {
  id: string
  name: string | null
  username: string | null
  image: string | null
  email: string | null
  bannedUntil: Date | null
  customId: string
  count: number
  logs: {
    id: string
    details: string
    createdAt: Date
    admin: { name: string | null, username: string | null, image: string | null }
  }[]
}

export default function PunishmentsClient({ initialData }: { initialData: PunishedUser[] }) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({})
  const [breakdownUser, setBreakdownUser] = useState<PunishedUser | null>(null)

  const itemsPerPage = 15

  const filteredData = useMemo(() => {
    if (!search.trim()) return initialData
    const lower = search.toLowerCase()
    return initialData.filter(u => 
      (u.username && u.username.toLowerCase().includes(lower)) || 
      u.customId.toLowerCase().includes(lower)
    )
  }, [search, initialData])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  function toggleExpand(userId: string) {
    setExpandedUsers(prev => ({ ...prev, [userId]: !prev[userId] }))
  }

  function getBreakdown(logs: PunishedUser["logs"]) {
    const counts: Record<string, number> = {}
    logs.forEach(log => {
      const actionStr = log.details.match(/\((.*?)\)/)?.[1] || "Không rõ"
      const isUnban = actionStr.toLowerCase().includes("gỡ khóa")
      if (!isUnban) {
        counts[actionStr] = (counts[actionStr] || 0) + 1
      }
    })
    return counts
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Tìm kiếm theo Username hoặc ID (VD: VN...)"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-10 p-3 rounded focus:outline-none focus:border-teal-500 transition"
          />
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-lg border border-slate-300 dark:border-slate-700 text-center text-slate-500">
          Không tìm thấy tài khoản nào.
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedData.map(user => {
            const isCurrentlyBanned = user.bannedUntil && new Date(user.bannedUntil) > new Date()
            const isExpanded = expandedUsers[user.id] || (search.trim() !== "" && filteredData.length === 1)
            
            return (
              <div key={user.id} className="bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden transition-all">
                <div 
                  className="p-4 bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-100 dark:bg-slate-800/80 transition"
                  onClick={() => toggleExpand(user.id)}
                >
                  <div className="flex items-center gap-4">
                    {user.image ? (
                      <img src={user.image} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xl text-slate-700 dark:text-slate-300">
                        {(user.username || "U").charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                        {user.username || "Người dùng ẩn danh"}
                        {isCurrentlyBanned && (
                          <span className="px-2 py-0.5 bg-red-900/50 text-red-400 border border-red-900 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Đang bị khóa
                          </span>
                        )}
                      </h3>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        <span>ID: {user.customId}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div 
                      className="text-right cursor-pointer group p-2 hover:bg-slate-200 dark:bg-slate-700 rounded transition flex items-center gap-3"
                      onClick={(e) => { e.stopPropagation(); setBreakdownUser(user); }}
                      title="Nhấn để xem chi tiết mức phạt"
                    >
                      <div className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:text-slate-300 transition">Số lần vi phạm</div>
                      <div className="text-2xl font-black text-orange-400 group-hover:scale-110 transition-transform inline-block">{user.count}</div>
                    </div>
                    <div className="text-slate-500">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-0 animate-in fade-in slide-in-from-top-2 duration-200">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700/50 text-xs uppercase tracking-wider text-slate-500">
                          <th className="p-3 font-semibold pl-6">Thời gian phạt</th>
                          <th className="p-3 font-semibold">Hình thức</th>
                          <th className="p-3 font-semibold pr-6">Người xử lý</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.logs.map(log => {
                          const banActionStr = log.details.match(/\((.*?)\)/)?.[1] || "Không rõ"
                          const isUnban = banActionStr.toLowerCase().includes("gỡ khóa")
                          return (
                            <tr key={log.id} className="border-b border-slate-300 dark:border-slate-700/50 hover:bg-slate-200 dark:bg-slate-700/30 transition last:border-0">
                              <td className="p-3 text-slate-700 dark:text-slate-300 text-sm pl-6">
                                {new Date(log.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${isUnban ? 'bg-teal-900/50 text-teal-400' : 'bg-red-900/50 text-red-400'}`}>
                                  {banActionStr}
                                </span>
                              </td>
                              <td className="p-3 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 pr-6">
                                {log.admin.image ? (
                                  <img src={log.admin.image} alt="" className="w-5 h-5 rounded-full" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] text-white">
                                    {(log.admin.username || "A").charAt(0)}
                                  </div>
                                )}
                                {log.admin.username || "Người dùng ẩn danh"}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded disabled:opacity-50 hover:bg-slate-200 dark:bg-slate-700 transition"
          >
            Trang trước
          </button>
          <span className="text-slate-600 dark:text-slate-400 font-medium">Trang {page} / {totalPages}</span>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded disabled:opacity-50 hover:bg-slate-200 dark:bg-slate-700 transition"
          >
            Trang tiếp
          </button>
        </div>
      )}

      {/* Breakdown Modal */}
      {breakdownUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setBreakdownUser(null)}
              className="absolute top-4 right-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            >
              <X size={20} />
            </button>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-300 dark:border-slate-700 pb-4 pr-6">
                Thống kê hình thức phạt
              </h3>
              
              <div className="flex items-center gap-4 mb-6">
                {breakdownUser.image ? (
                  <img src={breakdownUser.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                    {(breakdownUser.username || "U").charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{breakdownUser.username || "Ẩn danh"}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">{breakdownUser.customId}</div>
                </div>
              </div>

              <div className="space-y-3">
                {Object.entries(getBreakdown(breakdownUser.logs)).map(([action, count]) => (
                  <div key={action} className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-3 rounded border border-slate-300 dark:border-slate-700/50">
                    <span className="text-red-400 font-bold text-sm bg-red-900/30 px-2 py-1 rounded">{action}</span>
                    <span className="font-black text-slate-900 dark:text-white text-lg">x{count}</span>
                  </div>
                ))}
                
                {Object.keys(getBreakdown(breakdownUser.logs)).length === 0 && (
                  <div className="text-center text-slate-500 py-4 italic text-sm">
                    Người dùng này chưa có mức phạt cụ thể nào được ghi nhận.
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-slate-100 dark:bg-slate-800/50 text-center">
              <button 
                onClick={() => setBreakdownUser(null)}
                className="w-full py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-600 text-slate-900 dark:text-white hover:text-white rounded font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
