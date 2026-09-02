"use client"

import { useTheme } from "next-themes"
import { Clock3, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import {
  getStoredThemePreference,
  THEME_PREFERENCE_EVENT,
  THEME_PREFERENCE_KEY,
  type ThemePreference,
} from "./ScheduledThemeManager"

export default function ThemeToggle() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [preference, setPreference] = useState<ThemePreference>("auto")

  useEffect(() => {
    setMounted(true)
    setPreference(getStoredThemePreference())

    const syncPreference = () => setPreference(getStoredThemePreference())
    window.addEventListener(THEME_PREFERENCE_EVENT, syncPreference)
    window.addEventListener("storage", syncPreference)

    return () => {
      window.removeEventListener(THEME_PREFERENCE_EVENT, syncPreference)
      window.removeEventListener("storage", syncPreference)
    }
  }, [])

  const cyclePreference = () => {
    const nextPreference: ThemePreference =
      preference === "auto" ? "light" : preference === "light" ? "dark" : "auto"

    window.localStorage.setItem(THEME_PREFERENCE_KEY, nextPreference)
    setPreference(nextPreference)
    window.dispatchEvent(new Event(THEME_PREFERENCE_EVENT))
  }

  if (!mounted) {
    return <div className="w-8 h-8" />
  }

  return (
    <button
      onClick={cyclePreference}
      className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
      title={
        preference === "auto"
          ? `Tự động: ${resolvedTheme === "dark" ? "Tối" : "Sáng"} (Tối từ 18:00–06:00). Nhấn để chọn Sáng.`
          : `Đang chọn ${preference === "dark" ? "Tối" : "Sáng"}. Nhấn để chuyển chế độ.`
      }
      aria-label="Chuyển chế độ giao diện: Tự động, Sáng hoặc Tối"
    >
      {preference === "auto" ? (
        <Clock3 size={18} />
      ) : preference === "dark" ? (
        <Moon size={18} />
      ) : (
        <Sun size={18} />
      )}
    </button>
  )
}
