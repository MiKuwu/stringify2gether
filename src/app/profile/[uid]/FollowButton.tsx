"use client"
import { useState } from "react"
import { toggleFollow } from "./actions"
import toast from "react-hot-toast"
import { UserPlus, UserCheck } from "lucide-react"

export default function FollowButton({ targetUserId, initialFollowing }: { targetUserId: string, initialFollowing: boolean }) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  async function handleFollow() {
    setLoading(true)
    const original = following
    setFollowing(!following)
    
    const success = await toggleFollow(targetUserId)
    if (!success) {
      setFollowing(original)
      toast.error("Bạn cần đăng nhập để theo dõi.")
    } else {
      if (!original) toast.success("Đã theo dõi người dùng này!")
    }
    setLoading(false)
  }

  return (
    <button 
      onClick={handleFollow}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold transition ${
        following 
          ? "bg-slate-200 dark:bg-slate-700 hover:bg-red-900/50 hover:text-red-400 text-white" 
          : "bg-teal-600 hover:bg-teal-500 text-white"
      }`}
    >
      {following ? (
        <>
          <UserCheck size={20} />
          <span>Đang theo dõi</span>
        </>
      ) : (
        <>
          <UserPlus size={20} />
          <span>Theo dõi</span>
        </>
      )}
    </button>
  )
}
