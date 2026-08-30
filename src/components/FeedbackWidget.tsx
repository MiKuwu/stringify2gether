"use client"
import { useState } from "react"
import { MessageSquare, X, Image as ImageIcon, Link as LinkIcon, Send } from "lucide-react"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"
import { submitSuggestion } from "@/app/actions/feedback"

export default function FeedbackWidget({ promptMessage, promptIconUrl }: { promptMessage?: string, promptIconUrl?: string }) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!session) return null // Hide if not logged in

  function handlePromptImageUrl() {
    const url = window.prompt("Nhập đường dẫn URL của ảnh (nếu có):")
    if (url) {
      setImageUrls([...imageUrls, url])
    }
  }

  function handleRemoveFile(index: number) {
    setImages(images.filter((_, i) => i !== index))
  }
  
  function handleRemoveUrl(index: number) {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    let finalImageUrls = [...imageUrls]
    try {
      if (images.length > 0) {
        const { uploadFilesDirectly } = await import("@/lib/uploadHelpers")
        const uploadedMedia = await uploadFilesDirectly(images)
        finalImageUrls = [...finalImageUrls, ...uploadedMedia.map(m => m.url)]
      }
      
      const success = await submitSuggestion(content, finalImageUrls)
      if (success) {
        toast.success("Đã gửi kiến nghị thành công. Cảm ơn bạn!")
        setIsOpen(false)
        setContent("")
        setImages([])
        setImageUrls([])
      } else {
        toast.error("Có lỗi xảy ra.")
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi tải ảnh lên")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-teal-600 hover:bg-teal-500 text-white p-4 rounded-full shadow-lg shadow-teal-900/20 transition-all hover:scale-110 flex items-center justify-center group"
        title="Góp ý cải thiện"
      >
        {promptIconUrl ? (
          <img src={promptIconUrl} alt="Feedback Icon" className="w-6 h-6 object-contain" />
        ) : (
          <MessageSquare size={24} />
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {promptIconUrl ? (
                  <img src={promptIconUrl} alt="Feedback Icon" className="w-5 h-5 object-contain" />
                ) : (
                  <MessageSquare className="text-teal-500" />
                )} Hộp thư góp ý
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white transition">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {promptMessage || "Gửi kiến nghị hoặc báo cáo lỗi cho Hội đồng Admin để cải thiện Strinova Guide Hub."}
              </p>
              
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Nội dung kiến nghị..." 
                required
                rows={5}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ring-teal-500/50 focus:border-teal-500 transition resize-none"
              />

              <div className="flex flex-wrap gap-2">
                {images.map((file, i) => (
                  <div key={`file-${i}`} className="relative w-20 h-20 group">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover rounded-lg border border-slate-300 dark:border-slate-700" />
                    <button type="button" onClick={() => handleRemoveFile(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {imageUrls.map((url, i) => (
                  <div key={`url-${i}`} className="relative w-20 h-20 group">
                    <img src={url} alt="Preview URL" className="w-full h-full object-cover rounded-lg border border-slate-300 dark:border-slate-700" />
                    <button type="button" onClick={() => handleRemoveUrl(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-2">
                <div className="flex gap-2">
                  <label className="cursor-pointer flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg text-sm font-bold transition-colors">
                    <ImageIcon size={18} /> Ảnh
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      className="hidden" 
                      onChange={e => {
                        if (e.target.files) {
                          setImages([...images, ...Array.from(e.target.files)])
                        }
                      }}
                    />
                  </label>
                  <button 
                    type="button" 
                    onClick={handlePromptImageUrl}
                    className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg text-sm font-bold transition-colors"
                  >
                    <LinkIcon size={18} /> Link
                  </button>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting || !content.trim()} 
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                  <Send size={18} />
                  {isSubmitting ? "Đang gửi..." : "Gửi thư"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
