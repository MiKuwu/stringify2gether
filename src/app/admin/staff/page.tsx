import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import StaffAdminClient from "./StaffAdminClient"

export default async function AdminStaffPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) {
    redirect("/")
  }

  const staff = await prisma.user.findMany({
    where: {
      role: {
        in: ["ADMIN", "ADMIN + FOUNDER"]
      }
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      regionCode: true,
      createdAt: true
    },
    orderBy: {
      role: "desc"
    }
  })

  // To show custom UID
  const staffWithUid = await Promise.all(staff.map(async (user) => {
    const index = await prisma.user.count({
      where: {
        createdAt: { lt: user.createdAt }
      }
    })
    const displayId = `${user.regionCode}${String(index).padStart(9, "0")}`
    return { ...user, displayId }
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 border-b border-slate-300 dark:border-slate-700 pb-4">Danh sách Ban Quản trị</h1>
      <StaffAdminClient staff={staffWithUid} isFounder={session.user.role === "ADMIN + FOUNDER"} />
    </div>
  )
}
