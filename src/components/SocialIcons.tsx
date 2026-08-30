"use client"
import toast from "react-hot-toast"

export default function SocialIcons({
  facebook,
  discord,
  youtube
}: {
  facebook?: string | null
  discord?: string | null
  youtube?: string | null
}) {
  const handleDiscordClick = () => {
    if (discord) {
      navigator.clipboard.writeText(discord)
      toast.success("Đã copy Discord username!")
    }
  }

  return (
    <div className="flex items-center gap-2">
      {facebook && (
        <a href={facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors text-slate-700 dark:text-slate-300 hover:text-white" title="Facebook">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
          </svg>
        </a>
      )}
      {discord && (
        <button onClick={handleDiscordClick} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-indigo-500 transition-colors text-slate-700 dark:text-slate-300 hover:text-white" title={`Discord: ${discord} (Click để copy)`}>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.9 6.8c-.2-.6-.9-1.2-1.6-1.5-2.2-1-5.1-1.4-8.3-1.4s-6.1.4-8.3 1.4c-.7.3-1.4.9-1.6 1.5-.6 2.3-.9 5.3-.9 7.8 0 2.5.3 5.5.9 7.8.2.6.9 1.2 1.6 1.5 2.2 1 5.1 1.4 8.3 1.4s6.1-.4 8.3-1.4c.7-.3 1.4-.9 1.6-1.5.6-2.3.9-5.3.9-7.8 0-2.5-.3-5.5-.9-7.8z" />
            <path d="M15 15.5c-1-1-2-1.5-3-1.5s-2 .5-3 1.5" />
            <circle cx="9" cy="11" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="15" cy="11" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </button>
      )}
      {youtube && (
        <a href={youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-red-600 transition-colors text-slate-700 dark:text-slate-300 hover:text-white" title="YouTube">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
          </svg>
        </a>
      )}
    </div>
  )
}
