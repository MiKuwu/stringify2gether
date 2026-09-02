"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import ScheduledThemeManager from "./ScheduledThemeManager";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        <ScheduledThemeManager />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
