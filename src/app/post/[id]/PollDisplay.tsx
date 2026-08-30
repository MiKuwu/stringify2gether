
"use client"
import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"
import { Clock, CheckCircle2, BarChart2, Users, Lock, Eye, EyeOff, X } from "lucide-react"

type PollOption = {
  id: string
  text: string | null
  imageUrl: string | null
  voteCount: number | null
  percentage: number | null
  voters: { username: string; image: string | null }[] | null
}

type PollData = {
  id: string
  question: string
  allowMultiple: boolean
  hideResults: boolean
  anonymous: boolean
  expiresAt: string | null
  isExpired: boolean
  showResults: boolean
  hasVoted: boolean
  userVotedOptionIds: string[]
  totalVotes: number | null
  options: PollOption[]
}

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState("")
  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft("Đã kết thúc"); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(d > 0 ? `${d}n ${h}g ${m}p` : `${h}g ${m}p ${s}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])
  return <span>{timeLeft}</span>
}

export default function PollDisplay({ pollId }: { pollId: string }) {
  const { data: session } = useSession()
  const [poll, setPoll] = useState<PollData | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [voting, setVoting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [fp, setFp] = useState<string | null>(null)
  const [showVoters, setShowVoters] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const fetchResults = useCallback(async () => {
    const res = await fetch(`/api/polls/${pollId}/results`)
    if (res.ok) setPoll(await res.json())
  }, [pollId])

  useEffect(() => {
    fetchResults()
    import("@fingerprintjs/fingerprintjs").then(FingerprintJS => {
      FingerprintJS.load().then(fpAgent => fpAgent.get()).then(result => setFp(result.visitorId))
    })
  }, [fetchResults])

  const handleSelect = (optionId: string) => {
    if (!poll) return
    if (poll.allowMultiple) {
      setSelected(prev => prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId])
    } else {
      setSelected([optionId])
    }
  }

  const handleVote = async () => {
    if (selected.length === 0) { toast.error("Vui lòng chọn ít nhất 1 đáp án!"); return }
    setVoting(true)
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIds: selected, fingerprint: fp })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Đã ghi nhận bình chọn!")
        await fetchResults()
        setSelected([])
      } else {
        setErrorMsg(data.error || "Có lỗi xảy ra.")
      }
    } catch {
      setErrorMsg("Lỗi kết nối mạng.")
    } finally {
      setVoting(false)
    }
  }

  if (!poll) return <div className="animate-pulse h-40 bg-slate-800 rounded-xl my-8"></div>

  const canVote = !!(session && !poll.hasVoted && !poll.isExpired)

  return (
    <>
      <div className="my-8 bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="bg-slate-700/50 px-5 py-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <BarChart2 className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wide">Bình chọn</span>
              {poll.allowMultiple && <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded-full">Chọn nhiều</span>}
              {poll.anonymous && (
                <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <EyeOff className="w-3 h-3" />Ẩn danh
                </span>
              )}
              {poll.hideResults && !poll.isExpired && !poll.hasVoted && (
                <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Eye className="w-3 h-3" />Ẩn kết quả
                </span>
              )}
            </div>
            <h3 className="font-bold text-lg text-white">{poll.question}</h3>
          </div>
          {poll.expiresAt && (
            <div className={`flex items-center gap-1.5 text-sm shrink-0 font-medium ${poll.isExpired ? "text-red-400" : "text-amber-400"}`}>
              {poll.isExpired ? <Lock className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              {poll.isExpired ? "Đã kết thúc" : <Countdown expiresAt={poll.expiresAt} />}
            </div>
          )}
        </div>

        <div className="p-5 space-y-3">
          {poll.options.map(option => {
            const isVotedByMe = poll.userVotedOptionIds.includes(option.id)
            const isSelected = selected.includes(option.id) || isVotedByMe
            const pct = option.percentage ?? 0
            const showBar = poll.showResults && option.voteCount !== null

            return (
              <div key={option.id} className="relative">
                <button
                  onClick={() => canVote ? handleSelect(option.id) : undefined}
                  disabled={!canVote}
                  className={`w-full text-left rounded-lg border transition-all overflow-hidden ${
                    isSelected
                      ? "border-teal-500 bg-teal-900/30"
                      : canVote
                      ? "border-slate-600 hover:border-teal-500/50 hover:bg-slate-700/50"
                      : "border-slate-700 bg-slate-800/30 cursor-default"
                  }`}
                >
                  {showBar && (
                    <div
                      className="absolute inset-0 bg-teal-500/10 rounded-lg transition-all duration-700 pointer-events-none"
                      style={{ width: `${pct}%` }}
                    />
                  )}
                  <div className="relative flex items-center gap-3 px-4 py-3">
                    {option.imageUrl && (
                      <div 
                        className="w-16 h-16 shrink-0 relative cursor-zoom-in"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(option.imageUrl);
                        }}
                      >
                        <img src={option.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                      </div>
                    )}
                    {canVote && (
                      <div className={`w-5 h-5 border-2 shrink-0 flex items-center justify-center transition-colors ${
                        poll.allowMultiple ? "rounded-md" : "rounded-full"
                      } ${isSelected ? "border-teal-400 bg-teal-400" : "border-slate-500"}`}>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-slate-900" />}
                      </div>
                    )}
                    <span className="flex-1 font-medium text-white text-sm sm:text-base">{option.text || "(Hình ảnh)"}</span>
                    {showBar && (
                      <div className="shrink-0 text-right">
                        <span className="font-bold text-teal-400">{pct}%</span>
                        <div className="text-xs text-slate-400">{option.voteCount} phiếu</div>
                      </div>
                    )}
                    {poll.showResults && !poll.anonymous && option.voters && option.voters.length > 0 && (
                      <button
                        onClick={e => { e.stopPropagation(); setShowVoters(showVoters === option.id ? null : option.id) }}
                        className="text-slate-400 hover:text-teal-400 transition-colors shrink-0"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {showVoters === option.id && option.voters && (
                    <div className="px-4 pb-3 flex flex-wrap gap-1">
                      {option.voters.map((v, i) => (
                        <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                          {v.username}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              </div>
            )
          })}

          {errorMsg && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-300 text-sm px-4 py-3 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-700">
            <div className="text-sm text-slate-400">
              {poll.showResults && poll.totalVotes !== null ? `${poll.totalVotes} lượt bình chọn` : "? lượt bình chọn"}
            </div>
            {canVote ? (
              <button
                onClick={handleVote}
                disabled={voting || selected.length === 0}
                className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {voting ? "Đang gửi..." : "Bình chọn"}
              </button>
            ) : poll.isExpired ? (
              <span className="text-sm text-red-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Đã kết thúc</span>
            ) : poll.hasVoted ? (
              <span className="text-sm text-teal-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Đã bình chọn</span>
            ) : !session ? (
              <span className="text-sm text-slate-400">Đăng nhập để bình chọn</span>
            ) : null}
          </div>
        </div>
      </div>

      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
            onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={previewImage} 
            alt="Full size preview" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </>
  )
}
