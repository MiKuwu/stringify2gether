import type { Metadata, Viewport } from "next";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { getCachedSiteSettings, getCachedCategories } from "@/lib/cache";
import AnnouncementPopup from "@/components/AnnouncementPopup";
import MaintenancePoller from "@/components/MaintenancePoller";
import GlobalLoading from "@/components/GlobalLoading";
import LoginPromptModal from "@/components/LoginPromptModal";
import LoginRecommendation from "@/components/LoginRecommendation";
import RealtimeRefresher from "@/components/RealtimeRefresher";
import { GoogleAnalytics } from "@next/third-parties/google";
import FeedbackWidget from "@/components/FeedbackWidget";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteSettings();
  return {
    title: settings?.siteTitle || "Strinova Guide Hub",
    description: settings?.siteDescription || "Knowledge sharing for Strinova",
    icons: settings?.faviconUrl ? [{ rel: "icon", url: settings.faviconUrl }] : undefined,
    verification: {
      google: "lkP2u5ftg-q6JhCbmCKM2oATb1jNZ5d6zyKtwVvEgXQ",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // PERFORMANCE: No getServerSession here — enables Vercel CDN edge caching.
  // Session is read client-side by Navbar (useSession hook) and other components.
  const [settings, categories] = await Promise.all([
    getCachedSiteSettings(),
    getCachedCategories(),
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {settings?.googleAnalyticsId && <GoogleAnalytics gaId={settings.googleAnalyticsId} />}
      </head>
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col`}>
        <Providers>
          {/* MaintenancePoller handles maintenance check & UI client-side */}
          <MaintenancePoller />

          {settings?.popupEnabled && settings.popupText && (
            <AnnouncementPopup text={settings.popupText} imageUrl={settings.popupImageUrl || undefined} />
          )}
          <Navbar
            categories={categories}
            siteTitle={settings?.siteTitle || "Strinova Guide Hub"}
            siteTitleColor={settings?.siteTitleColor || undefined}
          />
          <GlobalLoading imageUrl={settings?.loadingImageUrl || undefined} />
          <RealtimeRefresher />
          <LoginRecommendation defaultMessage={settings?.loginPromptMessage || undefined} />
          <LoginPromptModal
            iconUrl={settings?.loginPromptIconUrl || undefined}
            defaultMessage={settings?.loginPromptMessage || undefined}
          />
          <FeedbackWidget
            promptMessage={settings?.feedbackPromptMessage || undefined}
            promptIconUrl={settings?.feedbackPromptIconUrl || undefined}
          />
          <Toaster position="bottom-right" toastOptions={{ style: { background: "#1e293b", color: "#fff" } }} />
          <main className="flex-1 overflow-x-hidden">{children}</main>
        </Providers>
      </body>
    </html>
  );
}