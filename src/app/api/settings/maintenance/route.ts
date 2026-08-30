import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Cached for 15 seconds — handles high traffic without hammering DB
export const revalidate = 15

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
      select: {
        maintenanceMode: true,
        maintenanceTitle: true,
        maintenanceMessage: true,
        maintenanceImageUrl: true,
      }
    })

    return NextResponse.json({
      maintenance: !!settings?.maintenanceMode,
      title: settings?.maintenanceTitle ?? null,
      message: settings?.maintenanceMessage ?? null,
      imageUrl: settings?.maintenanceImageUrl ?? null,
    })
  } catch {
    return NextResponse.json({ maintenance: false, title: null, message: null, imageUrl: null })
  }
}