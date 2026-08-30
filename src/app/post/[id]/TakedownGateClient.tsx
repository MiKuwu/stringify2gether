"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import AppealForm from "@/app/banned/AppealForm"

interface Props {
  postId: string
  iconUrl: string
  message: string
  takedownMessage: string | null
  authorId: string
  authorRole: string
}

export default function TakedownGateClient({ postId, iconUrl, message, takedownMessage, authorId, authorRole }: Props) {
  const { data: session, status } = useSession()
  const [postAppeal, setPostAppeal] = useState<boolean | null>(null)

  const isAuthor = session?.user?.id === authorId
  const isAdminOrFounder = session?.user?.role === "ADMIN" || session?.user?.role === "ADMIN + FOUNDER"
  const canView = isAuthor || isAdminOrFounder

  useEffect(() => {
    if (!isAuthor || !postId) return
    fetch(`/api/post-appeal-status?postId=${postId}`)
      .then(r => r.json())
      .then(d => setPostAppeal(d.alreadyAppealed ?? false))
      .catch(() => setPostAppeal(false))
  }, [isAuthor, postId])

  // Still loading session
  if (status === "loading") return null

  // Non-author, non-admin: show removed screen
  if (!canView) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-8 md:p-12 rounded-xl shadow-2xl max-w-lg w-full flex flex-col items-center">
          {iconUrl && (
            <img src={iconUrl} alt="Removed" className="w-32 h-32 md:w-40 md:h-40 object-contain mb-6 drop-shadow-md" />
          )}
          <h1 className="text-3xl font-bold text-red-500 mb-4">Bài viết đã bị gỡ</h1>
          <p className="text-slate-700 dark:text-slate-300 mb-8 whitespace-pre-wrap">{message}</p>
          <Link href="/" className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-8 rounded-full transition-all hover:scale-105 shadow-lg">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    )
  }

  // Author or Admin: show takedown notice + appeal form
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="bg-red-950/40 border border-red-900 rounded-lg p-6 mb-8 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Bài viết này đã bị gỡ</h2>
        <p className="text-slate-700 dark:text-slate-300 mb-4">
          {takedownMessage || "Bài viết vi phạm quy tắc cộng đồng."}
        </p>
        {isAuthor && postAppeal !== null && (
          <div className="max-w-md mx-auto">
            <AppealForm type="POST_TAKEDOWN" targetId={postId} alreadyAppealed={postAppeal} />
          </div>
        )}
      </div>
    </div>
  )
}