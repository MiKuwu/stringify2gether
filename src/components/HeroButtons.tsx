"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { X, Search, User } from "lucide-react"
import { searchUsers } from "@/app/actions/userSearch"
import { useSession } from "next-auth/react"
import { useAuthPromptStore } from "@/lib/store"
import { useRouter } from "next/navigation"

export default function HeroButtons({ rulesContent }: { rulesContent: string | null }) {
  const { status } = useSession()
  const { openPrompt } = useAuthPromptStore()
  const router = useRouter()
  
  const [isRulesOpen, setIsRulesOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true)
        const results = await searchUsers(searchQuery)
        setSearchResults(results)
        setIsSearching(false)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  return (
    <>
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button 
          onClick={() => {
            if (status === "unauthenticated") {
              openPrompt("Vui lòng đăng nhập để có thể chia sẻ giáo án và bài viết của bạn!")
            } else {
              router.push("/create")
            }
          }}
          className="bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105 text-sm md:text-base w-full sm:w-auto text-center"
        >
          CHIA SẺ GIÁO ÁN NGAY
        </button>
        {rulesContent && (
          <button 
            onClick={() => setIsRulesOpen(true)}
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105 text-sm md:text-base border border-white/40 w-full sm:w-auto text-center backdrop-blur-sm"
          >
            NỘI QUY CỘNG ĐỒNG
          </button>
        )}
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105 text-sm md:text-base border border-white/40 w-full sm:w-auto text-center flex items-center justify-center gap-2 backdrop-blur-sm"
        >
          <Search size={18} />
          TÌM KIẾM NGƯỜI DÙNG
        </button>
      </div>

      <style>{`
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalPopIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-overlay {
          animation: overlayFadeIn 0.3s ease-out forwards;
        }
        .animate-modal {
          animation: modalPopIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {isRulesOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-overlay" onClick={() => setIsRulesOpen(false)}>
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl relative animate-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h2 className="text-xl font-bold text-teal-400 uppercase">Nội quy cộng đồng</h2>
              <button onClick={() => setIsRulesOpen(false)} className="text-slate-600 dark:text-slate-400 hover:text-red-500 transition">
                <X size={24} />
              </button>
            </div>
            
            <div 
              className="p-6 overflow-y-auto overflow-x-hidden prose dark:prose-invert prose-teal max-w-none [&_*]:!max-w-full [&_*]:!whitespace-normal" 
              style={{ overflowWrap: 'break-word', wordBreak: 'normal' }}
              dangerouslySetInnerHTML={{ __html: (rulesContent || "").replace(/&nbsp;/g, ' ') }} 
            />
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-right">
              <button 
                onClick={() => setIsRulesOpen(false)}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-6 rounded transition-colors"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {isSearchOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/80 flex items-start justify-center p-4 pt-[10vh] backdrop-blur-sm animate-overlay" onClick={() => setIsSearchOpen(false)}>
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl relative animate-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50 dark:bg-slate-950">
              <Search className="text-slate-600 dark:text-slate-400" size={20} />
              <input 
                type="text" 
                autoFocus
                placeholder="Tìm kiếm theo Tên, Username hoặc ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-500"
              />
              <button onClick={() => setIsSearchOpen(false)} className="text-slate-600 dark:text-slate-400 hover:text-red-500 transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-2 max-h-[60vh]">
              {isSearching ? (
                <div className="p-4 text-center text-slate-600 dark:text-slate-400">Đang tìm kiếm...</div>
              ) : searchResults.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {searchResults.map(user => (
                    <Link 
                      key={user.id} 
                      href={`/profile/${user.customId || user.id}`}
                      className="flex items-center gap-3 p-3 hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                        {user.image ? (
                          <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="text-slate-600 dark:text-slate-400" size={20} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-teal-400 truncate">{user.username || "Người dùng ẩn danh"}</div>
                        <div className="text-xs text-slate-500 truncate">ID: {user.customId || user.id}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : searchQuery.trim().length > 0 ? (
                <div className="p-4 text-center text-slate-500">Không tìm thấy người dùng nào</div>
              ) : (
                <div className="p-4 text-center text-slate-500 text-sm">Nhập tên hoặc ID để tìm người dùng</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
