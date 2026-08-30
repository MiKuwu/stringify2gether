import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function POST(request: Request, { params }: { params: Promise<{ pollId: string }> }) {
  const { pollId } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ban can dang nhap de binh chon.", code: "NOT_LOGGED_IN" }, { status: 401 })
  }

  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || headersList.get("x-real-ip") || "unknown"

  const { optionIds, fingerprint } = await request.json()

  if (!optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
    return NextResponse.json({ error: "Chua chon dap an." }, { status: 400 })
  }

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: { options: true, votes: true }
  })

  if (!poll) return NextResponse.json({ error: "Poll khong ton tai." }, { status: 404 })

  if (poll.expiresAt && new Date() > new Date(poll.expiresAt)) {
    return NextResponse.json({ error: "Cuoc binh chon da ket thuc.", code: "EXPIRED" }, { status: 403 })
  }

  if (!poll.allowMultiple && optionIds.length > 1) {
    return NextResponse.json({ error: "Chi duoc chon 1 dap an." }, { status: 400 })
  }

  const existingVote = (poll.votes as any[]).find((v: any) => v.userId === session.user.id)
  if (existingVote) {
    return NextResponse.json({ error: "Ban da binh chon roi.", code: "ALREADY_VOTED" }, { status: 403 })
  }

  if (fingerprint) {
    const fpVote = (poll.votes as any[]).find((v: any) => v.fingerprint === fingerprint)
    if (fpVote) {
      return NextResponse.json({ error: "Thiet bi nay da duoc dung de binh chon. Moi thiet bi chi duoc binh chon 1 lan.", code: "FINGERPRINT_BLOCKED" }, { status: 403 })
    }
  }

  const ipVoteCount = (poll.votes as any[]).filter((v: any) => v.ip === ip).length
  if (ip !== "unknown" && ipVoteCount >= 3) {
    return NextResponse.json({ error: "Dia chi mang da dat gioi han binh chon (3 lan/poll). Lien he admin neu can.", code: "IP_LIMITED" }, { status: 403 })
  }

  const isPrivateIp = ip === "unknown" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip === "::1"
  if (!isPrivateIp) {
    try {
      const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } })
      const apiKey = (settings as any)?.proxyCheckApiKey || ""
      const url = `https://proxycheck.io/v2/${ip}?vpn=1&asn=1${apiKey ? `&key=${apiKey}` : ""}`
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
      if (res.ok) {
        const data = await res.json()
        const ipData = data[ip]
        if (ipData && (ipData.proxy === "yes" || ipData.vpn === "yes" || ["VPN","TOR","SOCKS","HTTP","SOCKS4","SOCKS5"].includes(ipData.type))) {
          return NextResponse.json({ error: "Phat hien VPN/Proxy! Tat VPN de binh chon.", code: "VPN_DETECTED" }, { status: 403 })
        }
      }
    } catch (e) {
      console.error("Proxycheck error:", e)
    }
  }

  const votesToCreate = optionIds.map((optionId: string) => ({
    pollId,
    optionId,
    userId: session.user.id,
    ip,
    fingerprint: fingerprint || null,
  }))

  await prisma.pollVote.createMany({ data: votesToCreate })
  return NextResponse.json({ success: true })
}