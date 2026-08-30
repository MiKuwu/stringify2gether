"use client"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete("page")
    } else {
      params.set("page", String(page))
    }
    const query = params.toString()
    return query ? `${pathname}?${query}` : pathname
  }

  // Build page range: always show first, last, current ±1
  const pages: (number | "...")[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...")
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-10 flex-wrap">
      {/* Prev */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-3 py-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-600 hover:text-white transition text-sm"
        >
          ‹
        </Link>
      ) : (
        <span className="px-3 py-2 rounded bg-slate-100 dark:bg-slate-800/40 text-slate-600 text-sm cursor-default">‹</span>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 py-2 text-slate-500 text-sm">…</span>
        ) : (
          <Link
            key={p}
            href={getPageUrl(p as number)}
            className={`px-3 py-2 rounded text-sm transition ${
              p === currentPage
                ? "bg-teal-500 text-white font-bold"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-600 hover:text-white"
            }`}
          >
            {p}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-3 py-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-600 hover:text-white transition text-sm"
        >
          ›
        </Link>
      ) : (
        <span className="px-3 py-2 rounded bg-slate-100 dark:bg-slate-800/40 text-slate-600 text-sm cursor-default">›</span>
      )}
    </div>
  )
}
