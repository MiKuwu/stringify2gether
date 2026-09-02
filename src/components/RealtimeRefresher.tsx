"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RealtimeRefresher() {
  const router = useRouter()

  useEffect(() => {
    // Refresh Server Components every 5 minutes to fetch new posts
    // (reduced from 15s to avoid excessive DB network transfer)
    const interval = setInterval(() => {
      // Only refresh if user is near the top of the page to avoid layout shifts while reading
      if (document.visibilityState === "visible" && window.scrollY < 200) {
        router.refresh()
      }
    }, 300000)

    return () => clearInterval(interval)
  }, [router])

  return null
}
