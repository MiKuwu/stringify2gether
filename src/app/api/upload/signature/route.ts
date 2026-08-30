import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true })
}

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const timestamp = Math.round((new Date).getTime() / 1000)
  
  try {
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: 'strinova_hub',
      },
      cloudinary.config().api_secret!
    )
    
    const { prisma } = await import("@/lib/prisma")
    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { maxUploadSizeMB: true } })
    const maxUploadSizeMB = settings?.maxUploadSizeMB || 500
    
    return NextResponse.json({
      timestamp,
      signature,
      cloudName: cloudinary.config().cloud_name,
      apiKey: cloudinary.config().api_key,
      maxUploadSizeMB
    })
  } catch (err) {
    console.error("Signature error:", err)
    return NextResponse.json({ error: "Failed to generate signature" }, { status: 500 })
  }
}
