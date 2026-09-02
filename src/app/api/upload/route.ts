import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v2 as cloudinary } from "cloudinary"

export const maxDuration = 60 // Allow longer execution time for video uploads (Vercel Pro)

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.CLOUDINARY_URL) {
     return NextResponse.json({ error: "Vui lòng thêm biến môi trường CLOUDINARY_URL vào Vercel (ví dụ: cloudinary://API_KEY:API_SECRET@CLOUD_NAME)" }, { status: 500 })
  }

  const formData = await request.formData()
  const files = formData.getAll("files") as File[]
  
  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 })
  }

  const { prisma } = await import("@/lib/prisma")
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } })
  const maxSizeBytes = (settings?.maxUploadSizeMB || 5) * 1024 * 1024

  for (const file of files) {
    if (file.size > maxSizeBytes) {
      return NextResponse.json({ error: `File quá lớn. Giới hạn là ${settings?.maxUploadSizeMB || 5}MB` }, { status: 400 })
    }
  }

  const uploadPromises = files.map(async (file) => {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const type = file.type.startsWith("video/") ? "VIDEO" : "IMAGE"
    const resourceType = type === "VIDEO" ? "video" : "image"

    try {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            resource_type: resourceType, 
            folder: "strinova_hub",
            async: resourceType === "video" 
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        uploadStream.end(buffer)
      })

      return { url: result.secure_url, type }
    } catch (error) {
      console.error("Cloudinary upload error:", error)
      return null
    }
  })

  const results = await Promise.all(uploadPromises)
  const uploadedUrls = results.filter(r => r !== null)

  if (uploadedUrls.length === 0) {
     return NextResponse.json({ error: "Tất cả ảnh/video đều upload thất bại lên Cloudinary." }, { status: 500 })
  }

  return NextResponse.json({ files: uploadedUrls })
}
