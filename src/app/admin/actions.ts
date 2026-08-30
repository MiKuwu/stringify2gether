"use server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export async function saveSiteSettings(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")) return

  const siteTitle = formData.get("siteTitle") as string
  const logoUrl = formData.get("logoUrl") as string
  const bannerImage = formData.get("bannerImage") as string
  
  const popupEnabled = formData.get("popupEnabled") === "on"
  const popupText = formData.get("popupText") as string
  const popupImageUrl = formData.get("popupImageUrl") as string
  
  const maintenanceMode = formData.get("maintenanceMode") === "on"
  
  const siteDescription = formData.get("siteDescription") as string
  const maintenanceTitle = formData.get("maintenanceTitle") as string
  const maintenanceMessage = formData.get("maintenanceMessage") as string
  const maintenanceImageUrl = formData.get("maintenanceImageUrl") as string
  const faviconUrl = formData.get("faviconUrl") as string
  const homeTitle = formData.get("homeTitle") as string
  const loadingImageUrl = formData.get("loadingImageUrl") as string
  const maxUploadSizeMB = parseInt(formData.get("maxUploadSizeMB") as string || "5")
  const loginPromptIconUrl = formData.get("loginPromptIconUrl") as string
  const loginPromptMessage = formData.get("loginPromptMessage") as string

  const siteTitleColor = formData.get("siteTitleColor") as string
  const homeTitleColor = formData.get("homeTitleColor") as string
  const siteDescColor = formData.get("siteDescColor") as string
  const googleAnalyticsId = formData.get("googleAnalyticsId") as string
  let geminiApiKey = formData.get("geminiApiKey") as string | null
  
  const oldSettings = await prisma.siteSettings.findUnique({ where: { id: 1 } })

  if (session.user.role !== "ADMIN + FOUNDER") {
    geminiApiKey = oldSettings?.geminiApiKey || null
  }
  const notFoundMessage = formData.get("notFoundMessage") as string
  const notFoundIconUrl = formData.get("notFoundIconUrl") as string
  const proxyCheckApiKey = formData.get("proxyCheckApiKey") as string
  
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { 
      siteTitle, logoUrl, bannerImage, popupEnabled, popupText, popupImageUrl, maintenanceMode,
      siteDescription, maintenanceTitle, maintenanceMessage, maintenanceImageUrl, faviconUrl, homeTitle,
      loadingImageUrl, maxUploadSizeMB, loginPromptIconUrl, loginPromptMessage,
      siteTitleColor, homeTitleColor, siteDescColor, googleAnalyticsId, geminiApiKey,
      notFoundMessage, notFoundIconUrl, proxyCheckApiKey
    },
    create: { 
      id: 1, siteTitle, logoUrl, bannerImage, popupEnabled, popupText, popupImageUrl, maintenanceMode,
      siteDescription, maintenanceTitle, maintenanceMessage, maintenanceImageUrl, faviconUrl, homeTitle,
      loadingImageUrl, maxUploadSizeMB, loginPromptIconUrl, loginPromptMessage,
      siteTitleColor, homeTitleColor, siteDescColor, googleAnalyticsId, geminiApiKey,
      notFoundMessage, notFoundIconUrl, proxyCheckApiKey
    },
  })

  // Cleanup old cloudinary images if they were changed
  if (oldSettings) {
    const { deleteCloudinaryMedia } = await import("@/lib/cloudinary")
    
    const checkAndDelete = async (oldUrl: string | null | undefined, newUrl: string) => {
      if (oldUrl && oldUrl !== newUrl && oldUrl.includes('cloudinary.com')) {
        await deleteCloudinaryMedia(oldUrl, "IMAGE")
      }
    }

    await checkAndDelete(oldSettings.logoUrl, logoUrl)
    await checkAndDelete(oldSettings.bannerImage, bannerImage)
    await checkAndDelete(oldSettings.popupImageUrl, popupImageUrl)
    await checkAndDelete(oldSettings.maintenanceImageUrl, maintenanceImageUrl)
    await checkAndDelete(oldSettings.faviconUrl, faviconUrl)
    await checkAndDelete(oldSettings.loadingImageUrl, loadingImageUrl)
    await checkAndDelete(oldSettings.loginPromptIconUrl, loginPromptIconUrl)
  }

  const { logAdminAction } = await import("@/lib/adminLogger")
  await logAdminAction(session.user.id, "UPDATE_SETTINGS", "Cập nhật cài đặt chung của website")

  revalidatePath("/", "layout")
}
