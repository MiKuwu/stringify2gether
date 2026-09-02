"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"

export interface PostInteractionState {
  hasLiked: boolean
  likeCount: number
  hasSaved: boolean
  isMuted: boolean
  isFollowing: boolean
  isAuthor: boolean
  canDelete: boolean
}

type LoadedState = {
  postId: string
  value: PostInteractionState
}

type PostInteractionContextValue = {
  state: PostInteractionState | null
  setLikeState: (hasLiked: boolean, likeCount: number) => void
}

const PostInteractionContext = createContext<PostInteractionContextValue | null>(null)

export function PostInteractionProvider({
  postId,
  authorId,
  initialLikes,
  children,
}: {
  postId: string
  authorId: string
  initialLikes: number
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const userId = session?.user?.id
  const [loadedState, setLoadedState] = useState<LoadedState | null>(null)

  const fallbackState = useMemo<PostInteractionState>(() => ({
    hasLiked: false,
    likeCount: initialLikes,
    hasSaved: false,
    isMuted: false,
    isFollowing: false,
    isAuthor: false,
    canDelete: false,
  }), [initialLikes])

  useEffect(() => {
    if (status !== "authenticated" || !userId) return

    const controller = new AbortController()
    fetch(`/api/post-interactions?postId=${postId}&authorId=${authorId}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(response => {
        if (!response.ok) throw new Error("Không thể tải trạng thái bài viết")
        return response.json() as Promise<PostInteractionState>
      })
      .then(value => setLoadedState({ postId, value }))
      .catch(error => {
        if (error instanceof Error && error.name === "AbortError") return
        setLoadedState({ postId, value: fallbackState })
      })

    return () => controller.abort()
  }, [authorId, fallbackState, postId, status, userId])

  const state = status === "unauthenticated"
    ? fallbackState
    : loadedState?.postId === postId
      ? loadedState.value
      : null

  const setLikeState = useCallback((hasLiked: boolean, likeCount: number) => {
    setLoadedState(current => ({
      postId,
      value: {
        ...(current?.postId === postId ? current.value : fallbackState),
        hasLiked,
        likeCount,
      },
    }))
  }, [fallbackState, postId])

  return (
    <PostInteractionContext.Provider value={{ state, setLikeState }}>
      {children}
    </PostInteractionContext.Provider>
  )
}

export function usePostInteractionState() {
  const context = useContext(PostInteractionContext)
  if (!context) {
    throw new Error("usePostInteractionState phải nằm trong PostInteractionProvider")
  }
  return context
}
