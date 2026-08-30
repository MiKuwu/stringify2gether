import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function NotFound() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } })
  const iconUrl = settings?.notFoundIconUrl || "https://media.discordapp.net/attachments/1122501061730074695/1337093259505500281/strinova-guide-hub-logo.png"
  const message = settings?.notFoundMessage || "Oh no! Có vẻ như nội dung này không tồn tại hoặc đã bị gỡ bỏ."

  return (
    <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-8 md:p-12 rounded-xl shadow-2xl max-w-lg w-full flex flex-col items-center">
        {iconUrl && (
          <img 
            src={iconUrl} 
            alt="Not Found" 
            className="w-32 h-32 md:w-40 md:h-40 object-contain mb-6 drop-shadow-md"
          />
        )}
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-4">404</h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 whitespace-pre-wrap">
          {message}
        </p>
        <Link 
          href="/"
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-8 rounded-full transition-all hover:scale-105 shadow-lg"
        >
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  )
}