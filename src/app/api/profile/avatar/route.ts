import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { imageUrl } = await request.json()
  if (!imageUrl) return NextResponse.json({ error: "Missing image url" }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true }
  })

  // Delete old avatar if it exists and is on Cloudinary
  if (user?.image && user.image.includes('cloudinary.com')) {
    const { deleteCloudinaryMedia } = await import("@/lib/cloudinary")
    await deleteCloudinaryMedia(user.image, "IMAGE")
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: imageUrl }
  })

  return NextResponse.json({ success: true })
}
