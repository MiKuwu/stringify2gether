"use client"
import { useState } from "react"
import { findPostByDisplayId, deletePostAdmin } from "./actions"

import toast from "react-hot-toast"

export default function PostsAdminClient() {
  const [searchId, setSearchId] = useState("")
  const [post, setPost] = useState<any>(null)
  const [error, setError] = useState("")

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setPost(null)
    const result = await findPostByDisplayId(searchId)
    if (result) {
      setPost(result)
    } else {
      setError("Không tìm thấy bài viết với ID này.")
    }
  }

  async function handleDelete() {
    if (!post) return
    if (!confirm("Xác nhận xóa vĩnh viễn bài viết này?")) return
    const success = await deletePostAdmin(post.displayId)
    if (success) {
      toast.success("Đã xóa bài viết!")
      setPost(null)
      setSearchId("")
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-4 mb-8">
        <input 
          type="text" 
          placeholder="Nhập Custom ID bài viết (VD: ob200826173000)"
          value={searchId}
          onChange={e => setSearchId(e.target.value)}
          className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-white p-3 rounded focus:outline-none focus:border-teal-500"
          required
        />
        <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded font-bold transition">
          Tìm kiếm
        </button>
      </form>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {post && (
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded border border-slate-300 dark:border-slate-700 space-y-4">
          <div className="text-xl font-bold">{post.title}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <span>Đăng bởi: <strong className="text-teal-400">{post.author.username || "Ẩn danh"}</strong></span>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleString("vi-VN")}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-700">
            <a href={`/post/${post.displayId}`} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline mr-6">
              Xem bài viết gốc
            </a>
            <button onClick={handleDelete} className="bg-red-900 hover:bg-red-800 text-white px-6 py-2 rounded font-bold">
              Xóa bài viết
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
