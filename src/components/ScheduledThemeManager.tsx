"use client"

import { useTheme } from "next-themes"
import { useEffect } from "react"

export const THEME_PREFERENCE_KEY = "theme-preference"
export const THEME_PREFERENCE_EVENT = "theme-preference-change"

export type ThemePreference = "auto" | "light" | "dark"

export function getScheduledTheme(date = new Date()): "light" | "dark" {
  const hour = date.getHours()
  return hour >= 18 || hour < 6 ? "dark" : "light"
}

export function getStoredThemePreference(): ThemePreference {
  const stored = window.localStorage.getItem(THEME_PREFERENCE_KEY)
  return stored === "light" || stored === "dark" ? stored : "auto"
}

export default function ScheduledThemeManager() {
  const { setTheme } = useTheme()

  useEffect(() => {
    const applyThemePreference = () => {
      const preference = getStoredThemePreference()
      setTheme(preference === "auto" ? getScheduledTheme() : preference)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") applyThemePreference()
    }

    applyThemePreference()

    const interval = window.setInterval(applyThemePreference, 60_000)
    window.addEventListener("focus", applyThemePreference)
    window.addEventListener("storage", applyThemePreference)
    window.addEventListener(THEME_PREFERENCE_EVENT, applyThemePreference)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener("focus", applyThemePreference)
      window.removeEventListener("storage", applyThemePreference)
      window.removeEventListener(THEME_PREFERENCE_EVENT, applyThemePreference)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [setTheme])

  return null
}
