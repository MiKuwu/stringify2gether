import { findUserByCustomId } from "@/lib/user"
import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import FollowButton from "./FollowButton"
import CopyButton from "@/components/CopyButton"
import SocialIcons from "@/components/SocialIcons"
import DeleteDraftButton from "../DeleteDraftButton"

export default async function PublicProfilePage({ params, searchParams }: { params: Promise<{ uid: string }>, searchParams: Promise<{ tab?: string }> }) {
  const { uid } = await params
  const { tab } = await searchParams
  
  const user = await findUserByCustomId(uid)
  if (!user) notFound()

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { _count: { select: { followers: true, following: true } } }
  })
  if (!fullUser) notFound()

  const session = await getServerSession(authOptions)
  const isSelf = session?.user?.id === user.id
  const isAdminOrFounder = session?.user?.role === "ADMIN" || session?.user?.role === "ADMIN + FOUNDER"

  const activeTab = (isSelf && tab === "drafts") ? "drafts" : "posts"

  let postFilter: any = { status: "ACTIVE" }
  if (isSelf && activeTab === "drafts") {
    postFilter = { status: "DRAFT" }
  } else if (isSelf || isAdminOrFounder) {
    postFilter = { status: { in: ["ACTIVE", "TAKEDOWN"] } }
  }

  const posts = await prisma.post.findMany({
    where: { authorId: user.id, ...postFilter },
    include: { _count: { select: { likes: true, comments: true } } },
    orderBy: { createdAt: "desc" }
  })

  // To calculate total stats, we need all non-draft posts regardless of tab
  const allPublicPosts = await prisma.post.findMany({
    where: { authorId: user.id, status: { in: ["ACTIVE", "TAKEDOWN"] } },
    include: { _count: { select: { likes: true, comments: true } } }
  })

  const totalLikes = allPublicPosts.reduce((sum: number, post: any) => sum + post._count.likes, 0)
  const totalComments = allPublicPosts.reduce((sum: number, post: any) => sum + post._count.comments, 0)

  let isFollowing = false; if (session) { const followCheck = await prisma.follows.findUnique({ where: { followerId_followingId: { followerId: session.user.id, followingId: user.id } } }); isFollowing = !!followCheck; }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-8 mb-12 shadow-xl relative overflow-hidden">
        {fullUser.coverImage ? (
          <div className="absolute top-0 left-0 w-full h-32 md:h-48 opacity-40">
            <img src={fullUser.coverImage} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900"></div>
          </div>
        ) : (
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-teal-900/40 to-transparent"></div>
        )}
        
        <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-teal-500 overflow-hidden text-5xl border-4 border-slate-200 dark:border-slate-900 shadow-xl z-10">
          {fullUser.image ? (
            <img src={fullUser.image} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            fullUser.username?.[0]?.toUpperCase() || "?"
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="text-4xl font-black mb-2 flex items-center justify-center md:justify-start gap-3">
            {fullUser.username || "Ẩn danh"}
            {fullUser.role === "ADMIN + FOUNDER" && (
              <span className="text-xs bg-red-900/40 text-red-400 border border-red-500/30 px-2 py-1 rounded font-bold uppercase tracking-wider">Founder</span>
            )}
            {fullUser.role === "ADMIN" && (
              <span className="text-xs bg-purple-900/40 text-purple-400 border border-purple-500/30 px-2 py-1 rounded font-bold uppercase tracking-wider">Admin</span>
            )}
            <div className="ml-2">
              <SocialIcons facebook={fullUser.facebookUrl} discord={fullUser.discordUrl} youtube={fullUser.youtubeUrl} />
            </div>
          </h1>
          <div className="text-teal-400 font-mono mb-4 text-lg flex items-center justify-center md:justify-start">
            UID: {uid}
            <CopyButton text={uid} label="UID" />
          </div>
          
          <div className="flex items-center justify-center md:justify-start gap-6 text-slate-700 dark:text-slate-300 mb-6">
            <div className="text-center">
              <span className="block font-bold text-2xl text-slate-900 dark:text-white">{fullUser._count.followers}</span>
              <span className="text-sm">Người theo dõi</span>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
            <div className="text-center">
              <span className="block font-bold text-2xl text-slate-900 dark:text-white">{fullUser._count.following}</span>
              <span className="text-sm">Đang theo dõi</span>
            </div>
          </div>
          
          <p className="text-slate-600 dark:text-slate-400 max-w-lg mb-6 whitespace-pre-wrap leading-relaxed">
            {fullUser.bio || "Người dùng này chưa cập nhật tiểu sử."}
          </p>

          {!isSelf && (
            <FollowButton targetUserId={fullUser.id} initialFollowing={isFollowing} />
          )}
          {isSelf && (
            <Link href="/profile" className="inline-block bg-slate-200 dark:bg-slate-700 hover:bg-slate-600 text-slate-900 dark:text-white hover:text-white px-6 py-2 rounded-full font-bold transition">
              Sửa hồ sơ
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-center shadow">
          <div className="text-slate-600 dark:text-slate-400 text-sm mb-1 uppercase tracking-wider font-bold">Bài viết</div>
          <div className="text-3xl font-black text-teal-400">{allPublicPosts.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-center shadow">
          <div className="text-slate-600 dark:text-slate-400 text-sm mb-1 uppercase tracking-wider font-bold">Lượt Thích</div>
          <div className="text-3xl font-black text-pink-500">{totalLikes}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-center shadow">
          <div className="text-slate-600 dark:text-slate-400 text-sm mb-1 uppercase tracking-wider font-bold">Bình luận</div>
          <div className="text-3xl font-black text-blue-400">{totalComments}</div>
        </div>
      </div>

      <div className="flex gap-6 mb-6 border-b border-slate-200 dark:border-slate-800">
        <Link 
          href={`/profile/${uid}`}
          className={`pb-4 text-lg font-bold border-b-2 transition-colors ${activeTab === 'posts' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300'}`}
        >
          Bài viết đã đăng ({allPublicPosts.length})
        </Link>
        {isSelf && (
          <Link 
            href={`/profile/${uid}?tab=drafts`}
            className={`pb-4 text-lg font-bold border-b-2 transition-colors ${activeTab === 'drafts' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300'}`}
          >
            Bản nháp
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition h-full flex flex-col relative overflow-hidden group">
            {post.status === "TAKEDOWN" && (
              <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                BỊ GỠ
              </div>
            )}
            {post.status === "DRAFT" && (
              <div className="absolute top-0 right-0 bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10 flex gap-1">
                NHÁP
              </div>
            )}
            
            <Link href={post.status === "DRAFT" ? `/edit/${post.displayId}` : `/post/${post.displayId}`} className="block flex-1">
              <h3 className="text-xl font-bold mb-2 group-hover:text-teal-400 transition">{post.title}</h3>
            </Link>
            
            <div className="mt-auto pt-4 text-sm text-slate-500 flex justify-between items-center">
              <span>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
              
              {post.status === "DRAFT" && isSelf && (
                <DeleteDraftButton postId={post.id} />
              )}
            </div>
          </div>
        ))}
        
        {posts.length === 0 && (
          <p className="text-slate-500 col-span-full">Chưa có bài viết nào.</p>
        )}
      </div>
    </div>
  )
}
