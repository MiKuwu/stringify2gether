"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import dynamic from "next/dynamic"
import "react-quill-new/dist/quill.snow.css"
import PollCreator, { PollDraft, defaultPoll } from "@/app/create/PollCreator"
import { useLoadingStore } from "@/lib/store"

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })

export default function EditPostForm({ 
  post, 
  categories 
}: { 
  post: any, 
  categories: any[] 
}) {
  const [loading, setLoadingLocal] = useState(false)
  const setLoadingGlobal = useLoadingStore(state => state.setLoading)
  const setUploadState = useLoadingStore(state => state.setUploadState)
  
  const [content, setContent] = useState(post.content || "")
  const [status, setStatus] = useState<"ACTIVE" | "DRAFT">(post.status || "ACTIVE")
  const [categoryId, setCategoryId] = useState(post.categoryId)
  
  type LocalFile = { id: string, file: File, preview: string, caption: string }
  type ExternalMedia = { id: string, url: string, caption: string }
  type KeptMedia = { id: string, url: string, type: string, caption: string }

  const [keptMedia, setKeptMedia] = useState<KeptMedia[]>(post.media || [])
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([])
  const [externalMedia, setExternalMedia] = useState<ExternalMedia[]>([])

  const initialPoll: PollDraft | null = post.poll ? {
    question: post.poll.question,
    allowMultiple: post.poll.allowMultiple,
    hideResults: post.poll.hideResults,
    anonymous: post.poll.anonymous,
    hasExpiry: !!post.poll.expiresAt,
    expiresAt: post.poll.expiresAt ? new Date(new Date(post.poll.expiresAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "",
    options: post.poll.options.map((o: any) => ({
      id: o.id,
      text: o.text || "",
      imageUrl: o.imageUrl || "",
      imageMode: o.imageUrl ? "url" : "upload"
    }))
  } : null

  const [poll, setPoll] = useState<PollDraft | null>(initialPoll)

  const [showExitModal, setShowExitModal] = useState(false)
  const [pendingUrl, setPendingUrl] = useState("")

  const router = useRouter()

  useEffect(() => {
    // Very basic check: if anything changed, warn
    const isDirty = content !== post.content || localFiles.length > 0 || externalMedia.length > 0
    
    // 1. Cảnh báo khi reload/đóng tab
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // 2. Cảnh báo khi điều hướng qua Next.js Link (bấm vào các thẻ a)
    const handleClick = (e: MouseEvent) => {
      if (!isDirty) return
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      if (anchor && anchor.href && anchor.target !== '_blank') {
        const url = new URL(anchor.href)
        if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
          e.preventDefault()
          e.stopPropagation()
          setPendingUrl(anchor.href)
          setShowExitModal(true)
        }
      }
    }
    document.addEventListener("click", handleClick, { capture: true })

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener("click", handleClick, { capture: true })
    }
  }, [content, post.content, localFiles, externalMedia])

  function handleConfirmExit() {
    window.removeEventListener('beforeunload', () => {})
    window.location.href = pendingUrl
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const newFiles = Array.from(e.target.files).map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      caption: ""
    }))
    setLocalFiles(prev => [...prev, ...newFiles])
    e.target.value = ''
  }

  function addExternalUrl() {
    setExternalMedia(prev => [...prev, { id: Math.random().toString(36).substring(7), url: "", caption: "" }])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoadingLocal(true)
    setLoadingGlobal(true)

    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    const finalStatus = (submitter?.value === "DRAFT") ? "DRAFT" : "ACTIVE"

    const form = new FormData(e.currentTarget)
    
    let newMediaData: { url: string, type: string, caption: string }[] = []
    
    if (localFiles.length > 0) {
      let timeoutId = setTimeout(() => {
        setLoadingGlobal(false)
        router.push("/")
        toast.success("Đang xử lý ở chế độ nền, bạn có thể tiếp tục lướt web!")
      }, 2000)
      
      try {
        setUploadState(true, 0)
        const { uploadFilesDirectly } = await import("@/lib/uploadHelpers")
        const filesToUpload = localFiles.map(lf => lf.file)
        const uploadedMedia = await uploadFilesDirectly(filesToUpload, (progress) => {
          setUploadState(true, progress)
        })
        setUploadState(false, 100)
        toast.success("Tải tệp tin thành công!")
        
        for (let i = 0; i < uploadedMedia.length; i++) {
          newMediaData.push({
            url: uploadedMedia[i].url,
            type: uploadedMedia[i].type,
            caption: localFiles[i].caption
          })
        }
      } catch (err: any) {
        clearTimeout(timeoutId)
        setUploadState(false, 0)
        toast.error(err.message || "Lỗi tải ảnh/video lên")
        setLoadingLocal(false)
        setLoadingGlobal(false)
        return
      }
      clearTimeout(timeoutId)
    }

    for (const ext of externalMedia) {
      if (!ext.url.trim()) continue
      const isVideo = ext.url.toLowerCase().match(/\.(mp4|webm|ogg)$/)
      newMediaData.push({
        url: ext.url,
        type: isVideo ? "VIDEO" : "IMAGE",
        caption: ext.caption
      })
    }

    const postData = {
      title: form.get("title") as string,
      content: content,
      categoryId: form.get("categoryId") as string,
      newMedia: newMediaData,
      keptMedia: keptMedia.map(m => ({ id: m.id, caption: m.caption })),
      status: finalStatus,
      watermarkText: form.get("watermarkText") || null,
      watermarkLogo: form.get("watermarkLogo") || null,
      isAiGenerated: form.get("isAiGenerated") === "on",
      poll: poll ? {
        question: poll.question,
        allowMultiple: poll.allowMultiple,
        hideResults: poll.hideResults,
        anonymous: poll.anonymous,
        expiresAt: poll.hasExpiry && poll.expiresAt ? new Date(poll.expiresAt).toISOString() : null,
        options: poll.options.map(o => ({ id: o.id, text: o.text || null, imageUrl: o.imageUrl || null }))
      } : null
    }

    try {
      const res2 = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData)
      })

      if (res2.ok) {
        const updatedPost = await res2.json()
        toast.success(finalStatus === "DRAFT" ? "Đã lưu bản nháp!" : "Cập nhật bài viết thành công!")
        router.push(`/post/${updatedPost.displayId || post.displayId}`)
        router.refresh()
      } else {
        const data = await res2.json()
        toast.error(data.error || "Lỗi khi lưu bài viết")
      }
    } catch (err) {
      toast.error("Lỗi mạng khi lưu bài")
    } finally {
      setLoadingLocal(false)
      setLoadingGlobal(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Tiêu đề bài viết</label>
        <input 
          type="text" 
          name="title" 
          defaultValue={post.title}
          required 
          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-white p-3 rounded focus:outline-none focus:border-teal-500 transition-colors"
          placeholder="Nhập tiêu đề..."
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Chuyên mục</label>
        <select 
          name="categoryId" 
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          required
          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-white p-3 rounded focus:outline-none focus:border-teal-500 transition-colors"
        >
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {categories.find(c => c.id === categoryId)?.protectMedia && (
        <div className="bg-teal-900/20 border border-teal-500/30 p-4 rounded-lg space-y-4">
          <h3 className="font-bold text-teal-400">🛡️ Bảo vệ bản quyền (Watermark)</h3>
          <p className="text-sm text-slate-300">Chuyên mục này yêu cầu bảo vệ tác phẩm. Bạn có thể sửa chữ và logo đóng dấu chìm.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Chữ ký (Watermark Text)</label>
              <input type="text" name="watermarkText" defaultValue={post.watermarkText || ""} placeholder="VD: Bản quyền thuộc về..." className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded text-sm" />
            </div>
            <div>
              <label className="block text-sm mb-1">Logo (Link ảnh trong suốt - tùy chọn)</label>
              <input type="text" name="watermarkLogo" defaultValue={post.watermarkLogo || ""} placeholder="VD: https://i.imgur.com/logo.png" className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded text-sm" />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          name="isAiGenerated" 
          id="isAiGenerated"
          defaultChecked={post.isAiGenerated}
          className="w-4 h-4 accent-teal-500 rounded bg-slate-800 border-slate-600"
        />
        <label htmlFor="isAiGenerated" className="font-medium text-slate-300">Nội dung chứa sản phẩm phái sinh từ AI?</label>
      </div>

      <div>
        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Nội dung</label>
        <div className="bg-white text-black rounded overflow-hidden border border-slate-300 dark:border-slate-700">
          <ReactQuill 
            theme="snow" 
            value={content} 
            onChange={setContent} 
            className="h-64 mb-12"
            modules={{
              toolbar: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'align': [] }],
                [{ 'color': [] }, { 'background': [] }],
                [{'list': 'ordered'}, {'list': 'bullet'}],
                ['link', 'clean']
              ],
            }}
          />
        </div>
      </div>

      {keptMedia.length > 0 && (
        <div>
          <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Ảnh/Video hiện tại</label>
          <div className="space-y-4">
            {keptMedia.map(m => (
              <div key={m.id} className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-300 dark:border-slate-700 items-start">
                <div className="relative w-32 h-32 shrink-0">
                  {m.type === "IMAGE" ? (
                    <img src={m.url} className="w-full h-full object-cover rounded" />
                  ) : (
                    <video src={m.url} className="w-full h-full object-cover rounded" />
                  )}
                </div>
                <div className="flex-1 w-full space-y-2">
                  <input 
                    type="text" 
                    placeholder="Nhập caption cho ảnh/video này (không bắt buộc)..." 
                    value={m.caption || ""}
                    onChange={e => setKeptMedia(prev => prev.map(f => f.id === m.id ? { ...f, caption: e.target.value } : f))}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-600 text-white p-2 rounded text-sm focus:outline-none focus:border-teal-500"
                  />
                  <button 
                    type="button" 
                    onClick={() => setKeptMedia(prev => prev.filter(f => f.id !== m.id))}
                    className="text-red-400 text-sm hover:text-red-300 font-medium"
                  >
                    Xóa tệp này
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Thêm tệp media mới (Từ thiết bị)</label>
        <input 
          type="file" 
          accept="image/*,video/*" 
          multiple
          onChange={handleFileSelect}
          className="block w-full text-sm text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-500 cursor-pointer"
        />
        
        {localFiles.length > 0 && (
          <div className="mt-4 space-y-4">
            {localFiles.map(lf => (
              <div key={lf.id} className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-300 dark:border-slate-700 items-start">
                {lf.file.type.startsWith('video/') ? (
                  <video src={lf.preview} className="w-32 h-32 object-cover rounded shrink-0" />
                ) : (
                  <img src={lf.preview} alt="" className="w-32 h-32 object-cover rounded shrink-0" />
                )}
                <div className="flex-1 w-full space-y-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{lf.file.name}</p>
                  <input 
                    type="text" 
                    placeholder="Nhập caption cho ảnh/video này (không bắt buộc)..." 
                    value={lf.caption}
                    onChange={e => setLocalFiles(prev => prev.map(f => f.id === lf.id ? { ...f, caption: e.target.value } : f))}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-600 text-white p-2 rounded text-sm focus:outline-none focus:border-teal-500"
                  />
                  <button 
                    type="button" 
                    onClick={() => setLocalFiles(prev => prev.filter(f => f.id !== lf.id))}
                    className="text-red-400 text-sm hover:text-red-300 font-medium"
                  >
                    Xóa file này
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Hoặc thêm tệp media qua Link URL</label>
          <button type="button" onClick={addExternalUrl} className="text-teal-400 text-sm font-bold hover:text-teal-300">
            + Thêm Link
          </button>
        </div>
        
        {externalMedia.length > 0 && (
          <div className="space-y-4">
            {externalMedia.map((ext, idx) => (
              <div key={ext.id} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1 w-full space-y-2">
                  <input 
                    type="text" 
                    placeholder="https://example.com/image.png" 
                    value={ext.url}
                    onChange={e => setExternalMedia(prev => prev.map(f => f.id === ext.id ? { ...f, url: e.target.value } : f))}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-600 text-white p-2 rounded text-sm focus:outline-none focus:border-teal-500"
                  />
                  <input 
                    type="text" 
                    placeholder="Nhập caption cho ảnh/video này (không bắt buộc)..." 
                    value={ext.caption}
                    onChange={e => setExternalMedia(prev => prev.map(f => f.id === ext.id ? { ...f, caption: e.target.value } : f))}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-600 text-white p-2 rounded text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => setExternalMedia(prev => prev.filter(f => f.id !== ext.id))}
                  className="text-red-400 text-sm hover:text-red-300 font-medium whitespace-nowrap pt-2"
                >
                  Xóa link
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      
      {/* Poll Creator */}
      {poll ? (
        <PollCreator value={poll} onChange={setPoll} onRemove={() => setPoll(null)} />
      ) : (
        <button
          type="button"
          onClick={() => setPoll(defaultPoll())}
          className="w-full border-2 border-dashed border-slate-600 hover:border-teal-500 text-slate-400 hover:text-teal-400 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>📊</span> Đính kèm Bình chọn (Poll)
        </button>
      )}

      <div className="flex gap-4">
        <button 
          value="ACTIVE"
          disabled={loading} 
          type="submit" 
          className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "Đăng bài"}
        </button>
        <button 
          value="DRAFT"
          disabled={loading} 
          type="submit" 
          className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
        >
          Lưu Nháp
        </button>
      </div>

      {showExitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-orange-500 mb-3">Chưa lưu thay đổi!</h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm mb-6 leading-relaxed">
              Bạn có bài viết đang soạn dở. Nếu rời đi bây giờ, mọi thay đổi chưa lưu sẽ bị mất. Bạn có chắc chắn muốn thoát?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                type="button" 
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-white text-sm font-bold rounded-lg transition"
              >
                Ở lại trang
              </button>
              <button 
                type="button" 
                onClick={handleConfirmExit}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded-lg transition"
              >
                Vẫn thoát
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
