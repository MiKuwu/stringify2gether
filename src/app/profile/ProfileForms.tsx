"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { signOut } from "next-auth/react"

export default function ProfileForms({
  userId,
  currentUsername,
  currentRegion,
  currentBio,
  currentFacebook,
  currentDiscord,
  currentYoutube,
  canChangeUsername,
  daysRemaining
}: {
  userId: string
  currentUsername: string
  currentRegion: string
  currentBio: string
  currentFacebook: string
  currentDiscord: string
  currentYoutube: string
  canChangeUsername: boolean
  daysRemaining: number
}) {
  const router = useRouter()
  const [loadingUser, setLoadingUser] = useState(false)
  const [loadingAvatar, setLoadingAvatar] = useState(false)

  async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canChangeUsername && currentUsername) {
      toast.error(`Bạn chưa thể đổi tên. Còn lại ${daysRemaining} ngày.`)
      // Continue anyway, maybe they just changed bio or region
    }

    setLoadingUser(true)
    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const regionCode = formData.get("regionCode") as string
    const bio = formData.get("bio") as string
    const facebookUrl = formData.get("facebookUrl") as string
    const discordUrl = formData.get("discordUrl") as string
    const youtubeUrl = formData.get("youtubeUrl") as string

    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, regionCode, bio, facebookUrl, discordUrl, youtubeUrl })
    })

    if (res.ok) {
      toast.success("Cập nhật thông tin thành công!")
      router.refresh()
    } else {
      const data = await res.json()
      toast.error(data.error || "Lỗi khi cập nhật")
    }
    setLoadingUser(false)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return
    
    setLoadingAvatar(true)
    const file = e.target.files[0]

    try {
      let toastId = toast.loading("Đang tải ảnh đại diện lên...")
      const { uploadFilesDirectly } = await import("@/lib/uploadHelpers")
      const files = await uploadFilesDirectly([file], (progress) => {
        toast.loading(`Đang tải ảnh đại diện lên... ${progress}%`, { id: toastId })
      })
      
      if (files && files.length > 0) {
        const imageUrl = files[0].url
        
        const updateRes = await fetch("/api/profile/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl })
        })

        if (updateRes.ok) {
          toast.success("Đổi ảnh đại diện thành công!", { id: toastId })
          router.refresh()
        } else {
          toast.error("Lỗi lưu ảnh đại diện", { id: toastId })
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi tải ảnh lên")
    }
    setLoadingAvatar(false)
  }

  const [loadingCover, setLoadingCover] = useState(false)
  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return
    
    setLoadingCover(true)
    const file = e.target.files[0]

    try {
      let toastId = toast.loading("Đang tải ảnh bìa lên...")
      const { uploadFilesDirectly } = await import("@/lib/uploadHelpers")
      const files = await uploadFilesDirectly([file], (progress) => {
        toast.loading(`Đang tải ảnh bìa lên... ${progress}%`, { id: toastId })
      })
      
      if (files && files.length > 0) {
        const imageUrl = files[0].url
        
        const updateRes = await fetch("/api/profile/cover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl })
        })

        if (updateRes.ok) {
          toast.success("Đổi ảnh bìa thành công!", { id: toastId })
          router.refresh()
        } else {
          toast.error("Lỗi lưu ảnh bìa", { id: toastId })
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi tải ảnh lên")
    }
    setLoadingCover(false)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Form đổi Avatar & Ảnh bìa */}
      <div className="flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Ảnh đại diện</h2>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Chọn ảnh mới từ máy tính của bạn để làm ảnh đại diện.</p>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleAvatarUpload}
              disabled={loadingAvatar}
              className="block w-full text-sm text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-500"
            />
            {loadingAvatar && <p className="text-teal-400 text-sm">Đang tải ảnh lên...</p>}
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Ảnh bìa (Cover)</h2>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Chọn ảnh chữ nhật ngang để làm ảnh bìa nổi bật cho trang cá nhân của bạn.</p>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleCoverUpload}
              disabled={loadingCover}
              className="block w-full text-sm text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-500"
            />
            {loadingCover && <p className="text-teal-400 text-sm">Đang tải ảnh lên...</p>}
          </div>
        </div>
      </div>

      {/* Form đổi Username & Khu vực */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-semibold mb-4">Cập nhật thông tin</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300">Khu vực (ID)</label>
            <select name="regionCode" defaultValue={currentRegion} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-white p-2 rounded">
              <option value="VN">VN - Việt Nam</option>
              <option value="CN">CN - Trung Quốc</option>
              <option value="KR">KR - Hàn Quốc</option>
              <option value="JP">JP - Nhật Bản</option>
              <option value="EU">EU - Châu Âu</option>
              <option value="NA">NA - Bắc Mỹ</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300">Username</label>
            <input 
              type="text" 
              name="username" 
              defaultValue={currentUsername} 
              disabled={!canChangeUsername && !!currentUsername}
              required 
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-white p-2 rounded disabled:opacity-50" 
            />
            {!canChangeUsername && currentUsername && (
               <p className="text-amber-400 text-xs mt-1">Đổi tên sau {daysRemaining} ngày nữa.</p>
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300">Tiểu sử (Bio)</label>
            <textarea 
              name="bio" 
              defaultValue={currentBio} 
              rows={3}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-white p-2 rounded"
              placeholder="Giới thiệu ngắn về bản thân..."
            />
          </div>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold mb-3">Mạng xã hội</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300">Facebook URL</label>
                <input type="text" name="facebookUrl" defaultValue={currentFacebook} placeholder="https://facebook.com/..." className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-white p-2 rounded" />
              </div>
              <div>
                <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300">Discord Username</label>
                <input 
                  type="text" 
                  name="discordUrl"
                  defaultValue={currentDiscord}
                  placeholder="VD: nguoichoianhdang..." 
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-white rounded p-2 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition" 
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300">YouTube URL</label>
                <input type="text" name="youtubeUrl" defaultValue={currentYoutube} placeholder="https://youtube.com/..." className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-white p-2 rounded" />
              </div>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loadingUser}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {loadingUser ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>
      {/* Form Xóa Tài Khoản */}
      <div className="bg-red-950/20 p-6 rounded-lg border border-red-900/50 md:col-span-2">
        <h2 className="text-xl font-semibold mb-4 text-red-400">Xóa tài khoản</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Xóa tài khoản là hành động <strong>không thể hoàn tác</strong>. Toàn bộ thông tin, bài viết, và bình luận của bạn sẽ bị xóa vĩnh viễn khỏi hệ thống.
        </p>
        <button 
          onClick={async () => {
            if (confirm("Bạn có CHẮC CHẮN muốn xóa tài khoản không? Hành động này không thể hoàn tác!")) {
              const res = await fetch("/api/profile/delete", { method: "POST" })
              if (res.ok) {
                toast.success("Đã xóa tài khoản. Đang đăng xuất...")
                await signOut({ callbackUrl: "/" })
              } else {
                toast.error("Có lỗi xảy ra khi xóa tài khoản")
              }
            }
          }}
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-medium transition"
        >
          Xóa tài khoản vĩnh viễn
        </button>
      </div>
    </div>
  )
}
