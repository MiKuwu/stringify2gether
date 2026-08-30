"use client"
import { useState } from "react"
import { toggleLike, addComment, deletePost, addReport, voteComment } from "./actions"
import { Heart, MessageCircle, Share2, Trash2, Flag, ArrowBigUp, ArrowBigDown, Image as ImageIcon, X, Link as LinkIcon } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { useSession } from "next-auth/react"
import ReportModal from "@/components/ReportModal"
import { useAuthPromptStore } from "@/lib/store"
import AppealForm from "@/app/banned/AppealForm"

import CommentOptionsMenu from "./CommentOptionsMenu"
import { editComment } from "./actions"

function CommentItem({ comment, session, getReplies, postId }: { comment: any, session: any, getReplies: (id: string) => any[], postId: string }) {
  const [upvotes, setUpvotes] = useState<number>(comment.upvotes || 0)
  const [downvotes, setDownvotes] = useState<number>(comment.downvotes || 0)
  const [userVote, setUserVote] = useState<1 | -1 | 0>(comment.userVote || 0)
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [replyImage, setReplyImage] = useState<File | null>(null)
  const [replyImageUrlStr, setReplyImageUrlStr] = useState("")
  const [isUploadingReply, setIsUploadingReply] = useState(false)
  
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImageUrlStr, setEditImageUrlStr] = useState(comment.imageUrl || "")
  const [isUploadingEdit, setIsUploadingEdit] = useState(false)
  
  const [lightboxOpen, setLightboxOpen] = useState(false)

  
  const replies = getReplies(comment.id)
  
  const isAuthor = session?.user?.id === comment.authorId
  const isAdminOrFounder = session?.user?.role === "ADMIN" || session?.user?.role === "ADMIN + FOUNDER"

  if (comment.status === "TAKEDOWN") {
    if (!isAuthor && !isAdminOrFounder) {
      return (
        <div className="bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-red-900/30 text-slate-500 italic text-sm">
          Bình luận này đã bị gỡ do vi phạm quy tắc cộng đồng.
        </div>
      )
    }
  }

  async function handleVote(type: 1 | -1) {
    if (!session) {
      const { useAuthPromptStore } = require("@/lib/store")
      useAuthPromptStore.getState().openPrompt("Vui lòng đăng nhập để đánh giá bình luận.")
      return
    }
    
    let newVote: 1 | -1 | 0 = userVote === type ? 0 : type
    let newUpvotes = upvotes
    let newDownvotes = downvotes
    
    if (userVote === 1) newUpvotes -= 1
    if (userVote === -1) newDownvotes -= 1
    
    if (newVote === 1) newUpvotes += 1
    if (newVote === -1) newDownvotes += 1

    setUserVote(newVote)
    setUpvotes(newUpvotes)
    setDownvotes(newDownvotes)
    
    await voteComment(comment.id, newVote)
  }

  function handlePromptReplyImageUrl() {
    const url = window.prompt("Nhập đường dẫn URL của ảnh:")
    if (url) {
      setReplyImageUrlStr(url)
      setReplyImage(null)
    }
  }

  function handlePromptEditImageUrl() {
    const url = window.prompt("Nhập đường dẫn URL của ảnh:", editImageUrlStr || "")
    if (url !== null) {
      setEditImageUrlStr(url)
      setEditImageFile(null)
    }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!session) {
      const { useAuthPromptStore } = require("@/lib/store")
      useAuthPromptStore.getState().openPrompt("Vui lòng đăng nhập để trả lời bình luận.")
      return
    }
    if (!replyText.trim() && !replyImage && !replyImageUrlStr) return
    setIsUploadingReply(true)
    let imageUrl = replyImageUrlStr || undefined
    try {
      if (replyImage) {
        const { uploadFilesDirectly } = await import("@/lib/uploadHelpers")
        const uploadedMedia = await uploadFilesDirectly([replyImage])
        if (uploadedMedia.length > 0) {
          imageUrl = uploadedMedia[0].url
        }
      }
      await addComment(postId, replyText, comment.id, imageUrl)
      setReplyText("")
      setReplyImage(null)
      setReplyImageUrlStr("")
      setIsReplying(false)
      toast.success("Đã trả lời bình luận!")
    } catch (err: any) {
      toast.error(err.message || "Lỗi tải ảnh lên")
    } finally {
      setIsUploadingReply(false)
    }
  }

  async function handleSaveEdit() {
    if (!editText.trim() && !editImageFile && !editImageUrlStr) return
    setIsUploadingEdit(true)
    let finalImageUrl = editImageUrlStr || null
    try {
      if (editImageFile) {
        const { uploadFilesDirectly } = await import("@/lib/uploadHelpers")
        const uploadedMedia = await uploadFilesDirectly([editImageFile])
        if (uploadedMedia.length > 0) {
          finalImageUrl = uploadedMedia[0].url
        }
      }
      await editComment(comment.id, editText, finalImageUrl)
      setIsEditing(false)
      setEditImageFile(null)
      toast.success("Đã lưu bình luận")
    } catch (err: any) {
      toast.error(err.message || "Lỗi tải ảnh lên")
    } finally {
      setIsUploadingEdit(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className={`bg-white dark:bg-slate-900 p-4 rounded-xl flex gap-4 border ${comment.status === "TAKEDOWN" ? "border-red-500/50" : "border-slate-200 dark:border-slate-800"}`}>
        <Link href={`/profile/${comment.authorUid}`} className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full shrink-0 flex items-center justify-center font-bold text-teal-500 overflow-hidden hover:opacity-80 hover:ring-2 ring-teal-500 transition">
          {comment.author.image ? <img src={comment.author.image} alt="Avatar" className="w-full h-full object-cover" /> : comment.author.username?.[0]?.toUpperCase() || "?"}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/profile/${comment.authorUid}`} className="font-bold text-teal-400 hover:opacity-80 transition break-words">{comment.author.username || "Ẩn danh"}</Link>
              <span className="text-xs text-slate-500 shrink-0">
                {new Date(comment.createdAt).toLocaleString("vi-VN", { 
                  timeZone: "Asia/Ho_Chi_Minh",
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric"
                })}
              </span>
              {comment.editedAt && (
                <span className="text-xs text-slate-500 shrink-0 italic">
                  (Đã chỉnh sửa)
                </span>
              )}
              {comment.status === "TAKEDOWN" && (
                <span className="text-xs text-red-500 font-bold border border-red-500 px-1 rounded">BỊ GỠ</span>
              )}
            </div>
            
            <CommentOptionsMenu 
              commentId={comment.id}
              isAuthor={isAuthor}
              myRole={session?.user?.role}
              authorRole={comment.author.role}
              onEdit={() => setIsEditing(true)}
            />
          </div>
          
          {comment.status === "TAKEDOWN" && (
            <div className="bg-red-950/30 text-red-400 p-3 text-sm rounded mb-2 border border-red-900/50">
              <p className="mb-2"><strong>Lý do Gỡ:</strong> {comment.takedownMessage}</p>
              {isAuthor && (
                <div className="border-t border-red-900/50 pt-2 mt-2">
                  <AppealForm type="COMMENT_TAKEDOWN" targetId={comment.id} alreadyAppealed={comment.hasAppealed} />
                </div>
              )}
            </div>
          )}

          {isEditing ? (
            <div className="mt-2 mb-3 flex flex-col gap-2">
              <textarea 
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500"
                rows={3}
              />
              {editImageFile && (
                <div className="relative inline-block w-20 h-20">
                  <img src={URL.createObjectURL(editImageFile)} alt="Preview" className="w-full h-full object-cover rounded-lg border border-slate-300 dark:border-slate-700" />
                  <button type="button" onClick={() => setEditImageFile(null)} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1">
                    <X size={12} />
                  </button>
                </div>
              )}
              {editImageUrlStr && !editImageFile && (
                <div className="relative inline-block w-20 h-20">
                  <img src={editImageUrlStr} alt="Preview" className="w-full h-full object-cover rounded-lg border border-slate-300 dark:border-slate-700" />
                  <button type="button" onClick={() => setEditImageUrlStr("")} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1">
                    <X size={12} />
                  </button>
                </div>
              )}
              <div className="flex justify-between items-center mt-1">
                <div className="flex gap-2">
                  <label className="cursor-pointer flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded transition-colors" title="Đính kèm ảnh">
                    <ImageIcon size={14} />
                    <input type="file" accept="image/*" className="hidden" onChange={e => setEditImageFile(e.target.files?.[0] || null)} />
                  </label>
                  <button type="button" onClick={handlePromptEditImageUrl} className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded transition-colors" title="Nhập link ảnh">
                    <LinkIcon size={14} />
                  </button>
                </div>
                <div className="flex gap-3 items-center">
                  <button onClick={() => { setIsEditing(false); setEditImageFile(null); setEditImageUrlStr(comment.imageUrl || "") }} className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">Hủy</button>
                  <button onClick={handleSaveEdit} disabled={isUploadingEdit} className="text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded disabled:opacity-50">
                    {isUploadingEdit ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="text-slate-700 dark:text-slate-300 mb-3 break-words whitespace-pre-wrap">{comment.content}</p>
              {comment.imageUrl && (
                <>
                  <div 
                    className="mb-3 max-w-sm rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setLightboxOpen(true)}
                  >
                    <img src={comment.imageUrl} alt="Comment Attachment" className="w-full h-auto object-cover" loading="lazy" />
                  </div>
                  {lightboxOpen && (
                    <div 
                      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
                      onClick={() => setLightboxOpen(false)}
                    >
                      <img src={comment.imageUrl} alt="Attachment" className="max-w-full max-h-full object-contain cursor-default" onClick={e => e.stopPropagation()} />
                      <button 
                        className="absolute top-4 right-4 text-white hover:text-red-500 bg-black/50 p-2 rounded-full transition-colors"
                        onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
                      >
                        <X size={24} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => handleVote(1)}
                className={`p-1 rounded transition-colors ${userVote === 1 ? 'text-teal-500 bg-teal-500/10' : 'text-slate-500 hover:text-teal-400 hover:bg-slate-100 dark:bg-slate-800'}`}
              >
                <ArrowBigUp size={20} fill={userVote === 1 ? 'currentColor' : 'none'} />
              </button>
              <span className={`text-sm font-bold ${userVote === 1 ? 'text-teal-500' : 'text-slate-600 dark:text-slate-400'}`}>
                {upvotes}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => handleVote(-1)}
                className={`p-1 rounded transition-colors ${userVote === -1 ? 'text-red-500 bg-red-500/10' : 'text-slate-500 hover:text-red-400 hover:bg-slate-100 dark:bg-slate-800'}`}
              >
                <ArrowBigDown size={20} fill={userVote === -1 ? 'currentColor' : 'none'} />
              </button>
              <span className={`text-sm font-bold ${userVote === -1 ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>
                {downvotes}
              </span>
            </div>

            <button 
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs font-bold text-slate-500 hover:text-teal-400 transition"
            >
              TRẢ LỜI
            </button>
          </div>
          
          {isReplying && (
            <form onSubmit={handleReply} className="mt-4 flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" 
                  autoFocus
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`Trả lời ${comment.author.username}...`} 
                  className="flex-1 w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
                <div className="flex gap-2 justify-between sm:justify-end shrink-0">
                  <div className="flex gap-2 shrink-0">
                    <label className="cursor-pointer shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 sm:py-0 rounded-lg transition-colors" title="Đính kèm ảnh">
                      <ImageIcon size={16} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={e => setReplyImage(e.target.files?.[0] || null)}
                      />
                    </label>
                    <button 
                      type="button" 
                      onClick={handlePromptReplyImageUrl}
                      className="shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 sm:py-0 rounded-lg transition-colors" 
                      title="Nhập link ảnh"
                    >
                      <LinkIcon size={16} />
                    </button>
                  </div>
                  <button type="submit" disabled={isUploadingReply || (!replyText.trim() && !replyImage && !replyImageUrlStr)} className="shrink-0 flex-1 sm:flex-none flex items-center justify-center bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                    {isUploadingReply ? "Đang gửi..." : "Gửi"}
                  </button>
                </div>
              </div>
              {replyImage && (
                <div className="relative inline-block w-20 h-20">
                  <img src={URL.createObjectURL(replyImage)} alt="Preview" className="w-full h-full object-cover rounded-lg border border-slate-300 dark:border-slate-700" />
                  <button 
                    type="button" 
                    onClick={() => setReplyImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {replyImageUrlStr && (
                <div className="relative inline-block w-20 h-20">
                  <img src={replyImageUrlStr} alt="Preview URL" className="w-full h-full object-cover rounded-lg border border-slate-300 dark:border-slate-700" />
                  <button 
                    type="button" 
                    onClick={() => setReplyImageUrlStr("")}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
      
      {replies.length > 0 && (
        <div className="pl-14 space-y-3">
          {replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} session={session} getReplies={getReplies} postId={postId} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PostInteractions({ 
  postId, 
  initialLikes, 
  hasLiked,
  isAuthor,
  comments,
  displayId
}: { 
  postId: string
  initialLikes: number
  hasLiked: boolean
  isAuthor: boolean
  comments: any[]
  displayId: string
}) {
  const { data: session } = useSession()
  const { openPrompt } = useAuthPromptStore()
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(hasLiked)
  const [commentText, setCommentText] = useState("")
  const [commentImage, setCommentImage] = useState<File | null>(null)
  const [commentImageUrlStr, setCommentImageUrlStr] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "top">("newest")

  const sortedComments = [...comments].sort((a, b) => {
    if (sortOrder === "top") {
      return (b.score || 0) - (a.score || 0)
    }
    if (sortOrder === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }
    // newest default
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  async function handleLike() {
    if (!session) {
      openPrompt("Vui lòng đăng nhập để thích bài viết này.")
      return
    }
    setLiked(!liked)
    setLikes(liked ? likes - 1 : likes + 1)
    await toggleLike(postId)
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Đã copy link bài viết!")
  }

  function handlePromptImageUrl() {
    const url = window.prompt("Nhập đường dẫn URL của ảnh:")
    if (url) {
      setCommentImageUrlStr(url)
      setCommentImage(null)
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!session) {
      openPrompt("Vui lòng đăng nhập để tham gia bình luận.")
      return
    }
    if (!commentText.trim() && !commentImage && !commentImageUrlStr) return
    setIsUploading(true)
    let imageUrl = commentImageUrlStr || undefined
    try {
      if (commentImage) {
        const { uploadFilesDirectly } = await import("@/lib/uploadHelpers")
        const uploadedMedia = await uploadFilesDirectly([commentImage])
        if (uploadedMedia.length > 0) {
          imageUrl = uploadedMedia[0].url
        }
      }
      await addComment(postId, commentText, undefined, imageUrl)
      setCommentText("")
      setCommentImage(null)
      setCommentImageUrlStr("")
      toast.success("Đã gửi bình luận!")
    } catch (err: any) {
      toast.error(err.message || "Lỗi tải ảnh lên")
    } finally {
      setIsUploading(false)
    }
  }

  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  async function handleReport() {
    if (!session) {
      openPrompt("Vui lòng đăng nhập để báo cáo bài viết.")
      return
    }
    setIsReportModalOpen(true)
  }

  return (
    <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8">
      <div className="flex flex-wrap gap-4 mb-8">
        <button onClick={handleLike} className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-colors ${liked ? 'bg-pink-600 hover:bg-pink-500' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700'}`}>
          <Heart size={20} fill={liked ? "currentColor" : "none"} /> {likes} Thích
        </button>
        <button onClick={handleShare} className="flex items-center gap-2 px-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 rounded-full font-bold transition-colors">
          <Share2 size={20} /> Chia sẻ
        </button>
        
        <div className="md:ml-auto flex gap-4 w-full md:w-auto">
          <button onClick={handleReport} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-bold transition-colors">
            <Flag size={20} /> Báo cáo
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle /> Bình luận ({comments.length})
          </h3>
          <select 
            value={sortOrder} 
            onChange={e => setSortOrder(e.target.value as any)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-teal-500"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="top">Nhiều vote nhất</option>
          </select>
        </div>
        
        <form onSubmit={handleComment} className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input 
              type="text" 
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Viết bình luận của bạn..." 
              className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full px-6 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
            />
            <div className="flex gap-2 sm:gap-4 justify-between sm:justify-end shrink-0">
              <div className="flex gap-2 shrink-0">
                <label className="cursor-pointer shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-full transition-colors" title="Đính kèm ảnh">
                  <ImageIcon size={20} />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={e => setCommentImage(e.target.files?.[0] || null)}
                  />
                </label>
                <button 
                  type="button" 
                  onClick={handlePromptImageUrl}
                  className="shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-full transition-colors" 
                  title="Nhập link ảnh"
                >
                  <LinkIcon size={20} />
                </button>
              </div>
              <button type="submit" disabled={isUploading || (!commentText.trim() && !commentImage && !commentImageUrlStr)} className="shrink-0 flex-1 sm:flex-none flex items-center justify-center bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-full font-bold transition-colors disabled:opacity-50">
                {isUploading ? "Đang gửi..." : "Gửi"}
              </button>
            </div>
          </div>
          {commentImage && (
            <div className="relative inline-block w-24 h-24 sm:w-32 sm:h-32 ml-4">
              <img src={URL.createObjectURL(commentImage)} alt="Preview" className="w-full h-full object-cover rounded-lg border border-slate-300 dark:border-slate-700" />
              <button 
                type="button" 
                onClick={() => setCommentImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {commentImageUrlStr && (
            <div className="relative inline-block w-24 h-24 sm:w-32 sm:h-32 ml-4">
              <img src={commentImageUrlStr} alt="Preview URL" className="w-full h-full object-cover rounded-lg border border-slate-300 dark:border-slate-700" />
              <button 
                type="button" 
                onClick={() => setCommentImageUrlStr("")}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </form>

        <div className="space-y-4 mt-8">
          {sortedComments.filter(c => !c.parentId).map(c => (
            <CommentItem key={c.id} comment={c} session={session} getReplies={(id) => sortedComments.filter(r => r.parentId === id)} postId={postId} />
          ))}
          {sortedComments.length === 0 && (
            <p className="text-slate-500 text-center py-4">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          )}
        </div>
      </div>

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        postId={postId} 
      />
    </div>
  )
}
