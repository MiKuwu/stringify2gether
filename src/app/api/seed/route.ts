import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const categories = [
      { name: "Giáo án Outbreak", slug: "outbreak" },
      { name: "Chia sẻ Line-up", slug: "lineup" },
      { name: "Các giáo án, thông tin khác", slug: "other" }
    ]

    for (const cat of categories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat
      })
    }
    
    await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        siteTitle: "Strinova Guide Hub",
        logoUrl: "https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/2605541d-f8b6-42a1-a0bb-9fd25f808c2f.ico",
        bannerImage: "https://klbq-web-cms.strinova.com/prod/strinova_web/images/202503/b753f7ce-0a59-4639-be56-4c7504b19b92.jpg"
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
