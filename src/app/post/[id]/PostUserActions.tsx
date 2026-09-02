"use client"
import { useSession } from "next-auth/react"
import PostOptionsMenu from "./PostOptionsMenu"
import FollowButton from "@/app/profile/[uid]/FollowButton"
import { usePostInteractionState } from "./PostInteractionContext"

interface Props {
  postId: string
  displayId: string
  authorId: string
}

export default function PostUserActions({ postId, displayId, authorId }: Props) {
  const { data: session } = useSession()
  const { state } = usePostInteractionState()

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
