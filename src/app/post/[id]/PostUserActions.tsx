"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import PostOptionsMenu from "./PostOptionsMenu"
import FollowButton from "@/app/profile/[uid]/FollowButton"

interface PostInteractionState {
  hasLiked: boolean
  hasSaved: boolean
  isMuted: boolean
  isFollowing: boolean
  isAuthor: boolean
  canDelete: boolean
}

interface Props {
  postId: string
  displayId: string
  authorId: string
  authorUid: string
}

export default function PostUserActions({ postId, displayId, authorId, authorUid }: Props) {
  const { data: session, status } = useSession()
  const [state, setState] = useState<PostInteractionState | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      setState({ hasLiked: false, hasSaved: false, isMuted: false, isFollowing: false, isAuthor: false, canDelete: false })
      return
    }
    fetch(`/api/post-interactions?postId=${postId}&authorId=${authorId}`)
      .then(r => r.json())
      .then(data => setState(data))
      .catch(() => setState({ hasLiked: false, hasSaved: false, isMuted: false, isFollowing: false, isAuthor: false, canDelete: false }))
  }, [status, postId, authorId])

  if (!state) {
    // Loading state — render placeholders
    return (
      <div className="flex items-center gap-2">
        <div className="w-24 h-8 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {!state.isAuthor && session && (
        <div className="scale-75 origin-left shrink-0">
          <FollowButton targetUserId={authorId} initialFollowing={state.isFollowing} />
        </div>
      )}
      <PostOptionsMenu
        postId={postId}
        displayId={displayId}
        isAuthor={state.isAuthor}
        canDelete={state.canDelete}
        initialSaved={state.hasSaved}
        initialMuted={state.isMuted}
      />
    </div>
  )
}