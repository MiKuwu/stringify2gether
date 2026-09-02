import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import AppealForm from "./AppealForm"

export default async function BannedPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { bannedUntil: true, banReason: true, banMessage: true, bannedAt: true, id: true }
  })

  if (!user?.bannedUntil || new Date(user.bannedUntil) <= new Date()) {
    redirect("/")
  }

  const isPermanent = new Date(user.bannedUntil).getFullYear() === 2099
  
  // Check if they already appealed
  const existingAppeal = await prisma.appeal.findFirst({
    where: { type: "USER_BAN", targetId: user.id, status: "PENDING" }
  })

  const hoursSinceBan = user.bannedAt ? (new Date().getTime() - new Date(user.bannedAt).getTime()) / (1000 * 60 * 60) : 0
  const canAppeal = hoursSinceBan <= 24

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border-2 border-red-900/50 p-8 rounded-xl text-center max-w-2xl w-full shadow-2xl">
        <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-900">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-red-500 mb-2">Tài khoản bị vô hiệu hóa</h1>
        <p className="text-slate-700 dark:text-slate-300 text-lg mb-6">
          Tài khoản của bạn đã bị khóa do vi phạm các quy định của cộng đồng.
        </p>
        
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg mb-6 border border-slate-300 dark:border-slate-700 text-left space-y-4">
          <div>
            <div className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Thời hạn khóa:</div>
            <div className="text-orange-400 font-bold text-xl">
              {isPermanent ? "KHÓA VĨNH VIỄN" : `Bị khóa đến: ${new Date(user.bannedUntil).toLocaleString("vi-VN")}`}
            </div>
          </div>
          
          {user.banMessage && (
            <div>
              <div className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Lời nhắn từ Quản trị viên:</div>
              <div className="bg-red-950/20 text-red-200 border-l-4 border-red-500 p-3 rounded-r text-sm">
                {user.banMessage}
              </div>
            </div>
          )}
        </div>

        {canAppeal ? (
          <AppealForm type="USER_BAN" targetId={user.id} alreadyAppealed={!!existingAppeal} />
        ) : (
          <div className="mt-8 pt-6 border-t border-slate-300 dark:border-slate-700">
            <p className="text-slate-500 text-sm">
              Đã quá 24 giờ kể từ lúc bị khóa, bạn không thể gửi yêu cầu kháng nghị nữa.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
