import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ count: 0 })
  const role = session.user.role
  if (role !== "ADMIN" && role !== "ADMIN + FOUNDER") return NextResponse.json({ count: 0 })

  const [suggestions, appeals, reports] = await Promise.all([
    prisma.suggestion.count({ where: { status: "PENDING" } }),
    prisma.appeal.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "PENDING" } }),
  ])
  return NextResponse.json({ count: suggestions + appeals + reports })
}