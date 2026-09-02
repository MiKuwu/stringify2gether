import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import PostInteractions from "./PostInteractions"
import { getCustomIdsForUsers } from "@/lib/user"
import PostUserActions from "./PostUserActions"
import AiSummaryButton from "./AiSummaryButton"
import MediaGallery from "./MediaGallery"
import ProtectMediaScript from "./ProtectMediaScript"
import { Bot } from "lucide-react"
import PollDisplay from "./PollDisplay"
import { getCachedPost, getCachedSiteSettings } from "@/lib/cache"

export const revalidate = 300

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [post, settings] = await Promise.all([
    getCachedPost(id),
    getCachedSiteSettings()
  ])

  if (!post) notFound()

  // Takedown check: without session, show takedown screen for non-author/admin
  // The client PostUserActions will handle author/admin UI after hydration
  if (post.status === "TAKEDOWN") {
    // Show a generic "removed" screen for anonymous users
    // Author & Admins see content + appeal form — handled via client component
    const iconUrl = settings?.notFoundIconUrl || "https://media.discordapp.net/attachments/1122501061730074695/1337093259505500281/strinova-guide-hub-logo.png"
    const message = settings?.notFoundMessage || "Oh no! Có vẻ như nội dung này không tồn tại hoặc đã bị gỡ bỏ."
    return (
      <PostTakedownGate
        postId={post.id}
        iconUrl={iconUrl}
        message={message}
        takedownMessage={post.takedownMessage ?? null}
        authorId={post.authorId}
        authorRole={post.author.role}
      />
    )
  }

  const customIds = await getCustomIdsForUsers([
    post.authorId,
    ...post.comments.map(comment => comment.authorId),
  ])
  const authorUid = customIds[post.authorId] ?? ""

  const commentsWithUid = post.comments.map((c) => {
      const upvotes = c.votes.filter(v => v.type === 1).length
      const downvotes = c.votes.filter(v => v.type === -1).length
      return {
        ...c,
        upvotes,
        downvotes,
        score: upvotes - downvotes,
        userVote: 0, // Client will update this via PostInteractions
        authorUid: customIds[c.authorId] ?? "",
        hasAppealed: false, // Client component handles appeal state
      }
    })

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      {post.category.protectMedia && <ProtectMediaScript />}

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-teal-400 font-bold uppercase tracking-wider">
          <Link href={`/category/${post.category.slug}`} className="hover:underline">
            {post.category.name}
          </Link>
        </div>
        {/* PostUserActions fetches session client-side — no server session needed */}
        <PostUserActions
          postId={post.id}
          displayId={post.displayId}
          authorId={post.authorId}
          authorUid={authorUid || ""}
        />
      </div>

      <h1 className="text-4xl font-extrabold mb-6 leading-tight break-words">{post.title}</h1>

      <div className="mb-6">
        <AiSummaryButton postId={post.id} />
      </div>

      <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <Link href={`/profile/${authorUid}`} className="shrink-0 hover:opacity-80 transition group">
          <div className="relative w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-teal-500 overflow-hidden group-hover:ring-2 ring-teal-500 transition">
            {post.author.image ? (
              <Image src={post.author.image} alt="Avatar" fill sizes="44px" className="object-cover" />
            ) : (
              post.author.username?.[0]?.toUpperCase() || "?"
            )}
          </div>
        </Link>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${authorUid}`} className="font-medium text-slate-800 dark:text-slate-200 hover:text-teal-400 transition truncate max-w-[150px] sm:max-w-xs">
              {post.author.username || "Người dùng ẩn danh"}
            </Link>
          </div>
          <div className="text-xs sm:text-sm text-slate-500">
            {new Date(post.createdAt).toLocaleString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            })}
          </div>
        </div>
      </div>

      {post.isAiGenerated && (
        <div className="flex items-start gap-3 bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg mb-6">
          <Bot className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-purple-400">Nội dung có yếu tố AI</h4>
            <p className="text-sm text-slate-300">Tác giả đánh dấu bài viết này có sử dụng công cụ Trí Tuệ Nhân Tạo (AI) để hỗ trợ tạo ra hình ảnh, video hoặc văn bản. Vui lòng cân nhắc khi tham khảo.</p>
          </div>
        </div>
      )}

      <div
        className="prose dark:prose-invert prose-teal max-w-none mb-12 prose-img:rounded-xl prose-img:mx-auto whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: post.content.replace(/&nbsp;/g, ' ') }}
      />

      <MediaGallery media={post.media} protectMedia={post.category.protectMedia} watermarkText={post.watermarkText} watermarkLogo={post.watermarkLogo} />

      {post.poll && <PollDisplay pollId={post.poll.id} />}

      <PostInteractions
        postId={post.id}
        initialLikes={post._count.likes}
        hasLiked={false}
        isAuthor={false}
        comments={commentsWithUid}
        displayId={post.displayId}
      />
    </div>
  )
}

// Separate server component for takedown gate — lets client hydrate to check if author/admin
import TakedownGateClient from "./TakedownGateClient"

function PostTakedownGate({
  postId, iconUrl, message, takedownMessage, authorId, authorRole
}: {
  postId: string
  iconUrl: string
  message: string
  takedownMessage: string | null
  authorId: string
  authorRole: string
}) {
  return (
    <TakedownGateClient
      postId={postId}
      iconUrl={iconUrl}
      message={message}
      takedownMessage={takedownMessage}
      authorId={authorId}
      authorRole={authorRole}
    />
  )
}
