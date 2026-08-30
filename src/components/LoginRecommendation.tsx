"use client"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useAuthPromptStore } from "@/lib/store"

export default function LoginRecommendation({ defaultMessage }: { defaultMessage?: string }) {
  const { status } = useSession()
  const { openPrompt } = useAuthPromptStore()

  useEffect(() => {
    if (status === "unauthenticated") {
      const hasSeen = sessionStorage.getItem("hasSeenLoginPrompt")
      if (!hasSeen) {
        // Show after 3 seconds to let them see the site first
        const timer = setTimeout(() => {
          openPrompt(defaultMessage || "Vui lòng đăng nhập để trải nghiệm đầy đủ các tính năng như đăng bài, bình luận, và theo dõi người dùng khác.")
          sessionStorage.setItem("hasSeenLoginPrompt", "true")
        }, 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [status, openPrompt, defaultMessage])

  return null
}
