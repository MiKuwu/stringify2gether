import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProfileForms from "./ProfileForms"
import { checkBanAndRedirect } from "@/lib/checkBan"
import CopyButton from "@/components/CopyButton"
import SocialIcons from "@/components/SocialIcons"
import DeleteDraftButton from "./DeleteDraftButton"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/")
  
  await checkBanAndRedirect()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { 
      posts: {
        include: { _count: { select: { likes: true, comments: true } } },
        orderBy: { createdAt: "desc" }
      },
      savedPosts: {
        include: { post: { include: { author: true } } },
        orderBy: { createdAt: "desc" }
      },
      _count: { select: { followers: true, following: true } }
    }
  })
  if (!user) redirect("/")

  // @ts-ignore - createdAt might not be in the generated types if generation failed
  const createdAt = user.createdAt || new Date(0)
  
  const index = await prisma.user.count({
    where: {
      // @ts-ignore
      createdAt: { lt: createdAt }
    }
  })
  
  const displayId = `${user.regionCode}${String(index).padStart(9, "0")}`

  const now = new Date()
  const lastChange = user.lastUsernameChange ? new Date(user.lastUsernameChange) : null
  const daysSinceChange = lastChange ? Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24)) : 999
  const canChangeUsername = daysSinceChange >= 14

  const totalLikes = user.posts.reduce((sum, post) => sum + post._count.likes, 0)
  const totalComments = user.posts.reduce((sum, post) => sum + post._count.comments, 0)

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Thông tin cá nhân</h1>
      
      {/* Overview Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg mb-8 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
        {user.coverImage ? (
          <div className="absolute top-0 left-0 w-full h-32 md:h-48 opacity-40">
            <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900"></div>
          </div>
        ) : (
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-teal-900/40 to-transparent"></div>
        )}
        
        <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0 flex items-center justify-center border-4 border-slate-300 dark:border-slate-700 shadow-lg z-10">
          {user.image ? (
            <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-bold text-teal-500">{user.username?.[0]?.toUpperCase() || "?"}</span>
          )}
        </div>
        <div className="flex-1 space-y-3 text-center md:text-left z-10">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{user.username || "Chưa thiết lập"}</div>
            <SocialIcons facebook={user.facebookUrl} discord={user.discordUrl} youtube={user.youtubeUrl} />
          </div>
          <div className="text-slate-600 dark:text-slate-400 flex items-center justify-center md:justify-start gap-2">
            UID: <span className="text-teal-400 font-mono tracking-wider font-bold">{displayId}</span>
            <CopyButton text={displayId} label="UID" />
          </div>
          <div className="text-slate-600 dark:text-slate-400 flex flex-wrap gap-4 items-center justify-center md:justify-start">
            <span>Vai trò: <span className={user.role === "ADMIN" || user.role === "ADMIN + FOUNDER" ? "text-amber-400 font-bold" : "text-slate-800 dark:text-slate-200"}>{user.role}</span></span>
            <span className="text-slate-600">•</span>
            <span><strong className="text-slate-900 dark:text-white">{user._count.followers}</strong> Người theo dõi</span>
            <span className="text-slate-600">•</span>
            <span><strong className="text-slate-900 dark:text-white">{user._count.following}</strong> Đang theo dõi</span>
          </div>
        </div>
      </div>

      {/* Stats Block */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-center shadow">
          <div className="text-slate-600 dark:text-slate-400 text-sm mb-1 uppercase tracking-wider font-bold">Bài viết</div>
          <div className="text-3xl font-black text-teal-400">{user.posts.length}</div>
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

      <ProfileForms 
        userId={user.id} 
        currentUsername={user.username || ""} 
        currentRegion={user.regionCode || "VN"}
        currentBio={user.bio || ""}
        currentFacebook={user.facebookUrl || ""}
        currentDiscord={user.discordUrl || ""}
        currentYoutube={user.youtubeUrl || ""}
        canChangeUsername={canChangeUsername} 
        daysRemaining={canChangeUsername ? 0 : 14 - daysSinceChange} 
      />

      <h2 className="text-2xl font-bold mb-4 mt-12">Bài viết của bạn</h2>
      <div className="space-y-4">
        {user.posts.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">Bạn chưa có bài đăng nào.</p>
        ) : (
          user.posts.map(post => (
            <div key={post.id} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-semibold text-lg flex items-center gap-2">
                  {post.title}
                  {post.status === "DRAFT" && (
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Bản Nháp
                    </span>
                  )}
                  {post.status === "TAKEDOWN" && (
                    <span className="bg-red-900 text-red-200 text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Bị Gỡ
                    </span>
                  )}
                </div>
                {/* @ts-ignore */}
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{new Date(post.createdAt || 0).toLocaleDateString("vi-VN")}</div>
              </div>
              <div className="flex items-center gap-4">
                {post.status === "DRAFT" ? (
                  <>
                    <a href={`/edit/${post.displayId}`} className="text-orange-400 hover:underline font-medium">Chỉnh sửa</a>
                    <DeleteDraftButton postId={post.id} />
                  </>
                ) : (
                  <a href={`/post/${post.displayId}`} className="text-teal-400 hover:underline font-medium">Xem bài</a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4 mt-12">Bài viết đã lưu</h2>
      <div className="space-y-4">
        {user.savedPosts.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">Bạn chưa lưu bài đăng nào.</p>
        ) : (
          user.savedPosts.map(sp => (
            <div key={sp.id} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-semibold text-lg">{sp.post.title}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Đăng bởi {sp.post.author.username || "Ẩn danh"} • {new Date(sp.post.createdAt).toLocaleDateString("vi-VN")}</div>
              </div>
              <a href={`/post/${sp.post.displayId}`} className="text-teal-400 hover:underline font-medium">Xem bài</a>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
