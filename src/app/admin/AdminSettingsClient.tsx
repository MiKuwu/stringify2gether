"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { saveSiteSettings } from "./actions"

import { useLoadingStore } from "@/lib/store"

export default function AdminSettingsClient({ settings, userRole }: { settings: any, userRole: string }) {
  const [loading, setLoadingLocal] = useState(false)
  const setLoadingGlobal = useLoadingStore(state => state.setLoading)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoadingLocal(true)
    setLoadingGlobal(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      await saveSiteSettings(formData)
      toast.success("Đã lưu cài đặt chung!")
    } catch (err) {
      toast.error("Có lỗi xảy ra")
    } finally {
      setLoadingLocal(false)
      setLoadingGlobal(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border border-slate-300 dark:border-slate-700 space-y-4">
        <h2 className="text-xl font-bold border-b border-slate-300 dark:border-slate-700 pb-2 mb-4">Thông tin cơ bản</h2>
        <div>
          <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">Tiêu đề trang web (Trên thanh Nav)</label>
          <div className="flex gap-2">
            <input type="text" name="siteTitle" defaultValue={settings?.siteTitle || "Strinova Guide Hub"} className="flex-1 bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-teal-500 focus:outline-none" required />
            <input type="color" name="siteTitleColor" defaultValue={settings?.siteTitleColor || "#14b8a6"} className="w-10 h-10 p-0 border-0 rounded cursor-pointer" title="Chọn màu chữ" />
          </div>
        </div>
        <div>
          <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">Tiêu đề trang chủ (Chữ to giữa màn hình)</label>
          <div className="flex gap-2">
            <input type="text" name="homeTitle" defaultValue={settings?.homeTitle || settings?.siteTitle || "Strinova Guide Hub"} className="flex-1 bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-teal-500 focus:outline-none" required />
            <input type="color" name="homeTitleColor" defaultValue={settings?.homeTitleColor || "#ffffff"} className="w-10 h-10 p-0 border-0 rounded cursor-pointer" title="Chọn màu chữ" />
          </div>
        </div>
        <div>
          <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">Dòng mô tả ở trang chủ (Dưới tiêu đề)</label>
          <div className="flex gap-2">
            <textarea name="siteDescription" defaultValue={settings?.siteDescription || "Cộng đồng chia sẻ giáo án, line-up và kinh nghiệm chơi Strinova lớn nhất Việt Nam."} rows={2} className="flex-1 bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-teal-500 focus:outline-none" required></textarea>
            <input type="color" name="siteDescColor" defaultValue={settings?.siteDescColor || "#e2e8f0"} className="w-10 h-10 p-0 border-0 rounded cursor-pointer" title="Chọn màu chữ" />
          </div>
        </div>
        <div>
          <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">URL Logo</label>
          <input type="text" name="logoUrl" defaultValue={settings?.logoUrl || ""} className="w-full bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-teal-500 focus:outline-none" />
        </div>
        <div>
          <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">URL Favicon (Icon trên tab trình duyệt)</label>
          <input type="text" name="faviconUrl" defaultValue={settings?.faviconUrl || ""} className="w-full bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-teal-500 focus:outline-none" placeholder="https://example.com/icon.png" />
        </div>
        <div>
          <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">URL Ảnh bìa trang chủ (Banner)</label>
          <input type="text" name="bannerImage" defaultValue={settings?.bannerImage || ""} className="w-full bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-teal-500 focus:outline-none" />
        </div>
        <div>
          <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">URL Ảnh chờ Loading (GIF/PNG/JPG)</label>
          <input type="text" name="loadingImageUrl" defaultValue={settings?.loadingImageUrl || ""} className="w-full bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-teal-500 focus:outline-none" />
        </div>
        <div>
          <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">Giới hạn dung lượng tải lên mỗi bài viết (MB)</label>
          <input type="number" name="maxUploadSizeMB" defaultValue={settings?.maxUploadSizeMB || 5} min="1" max="100" className="w-full bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-teal-500 focus:outline-none" required />
        </div>
        <div>
          <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">Google Analytics ID (Ví dụ: G-XXXXXXXXXX)</label>
          <input type="text" name="googleAnalyticsId" defaultValue={settings?.googleAnalyticsId || ""} className="w-full bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-teal-500 focus:outline-none" placeholder="G-XXXXXXXXXX" />
        </div>
      </div>

      <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border border-slate-300 dark:border-slate-700 space-y-4">
        <h2 className="text-xl font-bold border-b border-slate-300 dark:border-slate-700 pb-2 mb-4 text-teal-400">Pop-up Thông báo</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Hiển thị một bảng thông báo giữa màn hình khi người dùng truy cập web.</p>
        
        <label className="flex items-center gap-2 cursor-pointer mb-4">
          <input type="checkbox" name="popupEnabled" defaultChecked={settings?.popupEnabled} className="w-5 h-5 accent-teal-500 rounded bg-white dark:bg-slate-900 border-slate-600" />
          <span className="font-bold">Bật hiển thị Pop-up</span>
        </label>
        
        <div>
          <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">Nội dung văn bản (Text)</label>
          <textarea name="popupText" defaultValue={settings?.popupText || ""} rows={3} className="w-full bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-teal-500 focus:outline-none" placeholder="Nhập thông báo..."></textarea>
        </div>
        <div>
          <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">URL Hình ảnh (tùy chọn)</label>
          <input type="text" name="popupImageUrl" defaultValue={settings?.popupImageUrl || ""} className="w-full bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-teal-500 focus:outline-none" placeholder="https://..." />
        </div>
      </div>

      <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border border-slate-300 dark:border-slate-700 space-y-4">
        <h2 className="text-xl font-bold border-b border-slate-300 dark:border-slate-700 pb-2 mb-4 text-teal-400">Yêu cầu đăng nhập</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Cài đặt thông báo hiển thị khi người dùng chưa đăng nhập muốn tương tác với hệ thống.</p>
        
        <div>
          <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">Lời nhắc nhở đăng nhập mặc định</label>
          <textarea name="loginPromptMessage" defaultValue={settings?.loginPromptMessage || "Vui lòng đăng nhập để trải nghiệm đầy đủ các tính năng như đăng bài, bình luận, và theo dõi người dùng khác."} rows={2} className="w-full bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-teal-500 focus:outline-none"></textarea>
        </div>
        <div>
          <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">Icon / Hình ảnh hiển thị (URL)</label>
          <input type="text" name="loginPromptIconUrl" defaultValue={settings?.loginPromptIconUrl || ""} className="w-full bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-teal-500 focus:outline-none" placeholder="Để trống sẽ dùng icon mặc định..." />
        </div>
      </div>

      <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border border-slate-300 dark:border-slate-700 space-y-4">
        <h2 className="text-xl font-bold border-b border-slate-300 dark:border-slate-700 pb-2 mb-4 text-teal-400">Trang 404 & Bài viết bị gỡ</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Cài đặt thông báo hiển thị khi người dùng truy cập vào liên kết không tồn tại hoặc bài viết đã bị gỡ.</p>
        
        <div>
          <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">Nội dung thông báo</label>
          <textarea name="notFoundMessage" defaultValue={settings?.notFoundMessage || "Oh no! Có vẻ như nội dung này không tồn tại hoặc đã bị gỡ bỏ."} rows={2} className="w-full bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-teal-500 focus:outline-none"></textarea>
        </div>
        <div>
          <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">Icon / Hình ảnh hiển thị (URL)</label>
          <input type="text" name="notFoundIconUrl" defaultValue={settings?.notFoundIconUrl || "https://media.discordapp.net/attachments/1122501061730074695/1337093259505500281/strinova-guide-hub-logo.png"} className="w-full bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-teal-500 focus:outline-none" placeholder="https://..." />
        </div>
      </div>

      <div className="bg-red-950/20 p-6 rounded-lg border border-red-900/50 space-y-4">
        <h2 className="text-xl font-bold border-b border-red-900/50 pb-2 mb-4 text-red-400">Chế độ Bảo trì (Maintenance)</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Khi bật, tất cả người dùng bình thường sẽ không thể truy cập trang web (chỉ Admin mới có thể vào).</p>
        
        <label className="flex items-center gap-2 cursor-pointer mb-4">
          <input type="checkbox" name="maintenanceMode" defaultChecked={settings?.maintenanceMode} className="w-6 h-6 accent-red-600 rounded bg-white dark:bg-slate-900 border-slate-600" />
          <span className="font-bold text-red-400">BẬT CHẾ ĐỘ BẢO TRÌ</span>
        </label>
        
        <div>
          <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">Tiêu đề bảo trì (dòng chữ màu xanh)</label>
          <input type="text" name="maintenanceTitle" defaultValue={settings?.maintenanceTitle || "Website Đang Bảo Trì"} className="w-full bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-red-500 focus:outline-none" />
        </div>
        <div>
          <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">Nội dung thông báo bảo trì (tùy chọn)</label>
          <textarea name="maintenanceMessage" defaultValue={settings?.maintenanceMessage || ""} rows={3} className="w-full bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-red-500 focus:outline-none" placeholder="Hệ thống đang được nâng cấp..."></textarea>
        </div>
        <div>
          <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">URL Hình ảnh bảo trì (tùy chọn)</label>
          <input type="text" name="maintenanceImageUrl" defaultValue={settings?.maintenanceImageUrl || ""} className="w-full bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-red-500 focus:outline-none" placeholder="https://..." />
          <div className="text-xs text-slate-500 mt-2">Bảo trì: Chỉ Admin và Founder mới có thể truy cập web.</div>
        </div>
      </div>

      {userRole === "ADMIN + FOUNDER" && (
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border border-slate-300 dark:border-slate-700 space-y-4">
          <h2 className="text-xl font-bold border-b border-slate-300 dark:border-slate-700 pb-2 mb-4">Cấu hình Trí Tuệ Nhân Tạo (AI)</h2>
          <div>
            <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">Google Gemini API Key</label>
            <input 
              type="password" 
              name="geminiApiKey" 
              defaultValue={settings?.geminiApiKey || ""} 
              placeholder="AIzaSy..." 
              className="w-full bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-teal-500 focus:outline-none" 
            />
            <p className="text-xs text-slate-500 mt-1">Dùng để chạy tính năng "Tóm tắt bài viết bằng AI". Lấy khóa miễn phí tại <a href="https://aistudio.google.com/" target="_blank" className="text-teal-500 hover:underline">Google AI Studio</a>. (Chỉ Founder mới xem được mục này)</p>
          </div>
        </div>
      )}

      <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border border-slate-300 dark:border-slate-700 space-y-4">
        <h2 className="text-xl font-bold border-b border-slate-300 dark:border-slate-700 pb-2 mb-4 text-teal-400">Chống Gian lận Bình chọn (Poll)</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">API Key của proxycheck.io dùng để phát hiện và chặn VPN/Proxy khi người dùng bình chọn. Lấy key miễn phí tại <a href="https://proxycheck.io/dashboard/" target="_blank" className="text-teal-400 hover:underline">proxycheck.io</a> (1000 lần kiểm tra/ngày với key).</p>
        <div>
          <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300 font-medium">Proxycheck.io API Key</label>
          <input
            type="text"
            name="proxyCheckApiKey"
            defaultValue={settings?.proxyCheckApiKey || ""}
            placeholder="Dán API Key vào đây..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-600 text-white rounded p-2 focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded transition-colors disabled:opacity-50">
        {loading ? "Đang lưu..." : "Lưu cài đặt"}
      </button>
    </form>
  )
}
