"use client"
import { useState } from "react"
import { Trash2 } from "lucide-react"
import { deletePost } from "@/app/post/[id]/actions"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function DeleteDraftButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm("Bạn có chắc chắn muốn xóa bản nháp này? Hành động này không thể hoàn tác.")) return
    setLoading(true)
    const success = await deletePost(postId, true)
    if (success) {
      toast.success("Đã xóa bản nháp")
      router.refresh()
    } else {
      toast.error("Có lỗi xảy ra khi xóa")
    }
    setLoading(false)
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="text-red-400 hover:text-red-300 hover:bg-red-900/30 p-2 rounded transition-colors"
      title="Xóa bản nháp"
    >
      <Trash2 size={18} />
    </button>
  )
}
