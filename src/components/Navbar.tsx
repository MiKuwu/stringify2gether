"use client"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { UserCircle, ShieldAlert, ChevronDown } from "lucide-react"
import NotificationDropdown from "./NotificationDropdown"
import ThemeToggle from "./ThemeToggle"

export default function Navbar({ 
  categories = [],
  siteTitle = "Strinova Hub",
  siteTitleColor,
}: { 
  categories?: { name: string, slug: string, hoverImageUrl?: string | null }[],
  siteTitle?: string,
  siteTitleColor?: string,
}) {
  const { data: session } = useSession()
  const [adminPendingCount, setAdminPendingCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Fetch admin pending count client-side — only for admins
  useEffect(() => {
    const role = session?.user?.role
    if (role !== "ADMIN" && role !== "ADMIN + FOUNDER") return
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/admin/pending-count")
        if (res.ok) {
          const data = await res.json()
          setAdminPendingCount(data.count || 0)
        }
      } catch { /* ignore */ }
    }
    fetchCount()
    const interval = setInterval(fetchCount, 60000) // refresh every 60s
    return () => clearInterval(interval)
  }, [session?.user?.role])

  useEffect(() => {
    const checkOverflow = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current
        setIsOverflowing(scrollWidth > clientWidth)
      }
    }
    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [categories])

  useEffect(() => {
    const handleClickOutside = () => {
      if (showDropdown) setShowDropdown(false)
    }
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showDropdown])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)


  return (
    <nav className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="min-w-0 max-w-[12rem] shrink text-xl font-bold uppercase leading-tight tracking-wider text-teal-500 dark:text-teal-400 whitespace-normal break-words sm:max-w-xs md:shrink-0 md:whitespace-nowrap"
          style={siteTitleColor ? { color: siteTitleColor } : {}}
        >
          {siteTitle}
        </Link>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(open => !open)}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2"
            aria-controls="mobile-menu"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Desktop Menu - Categories (Scrollable with Dropdown) */}
        <div className="hidden md:flex flex-1 mx-4 relative items-center min-w-0">
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex items-center gap-2 font-medium text-sm mask-edges px-2"
          >
            {categories.map(cat => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} className="shrink-0 relative group px-4 py-2 rounded-lg transition-all duration-300 hover:ring-2 hover:ring-teal-400 hover:shadow-[0_0_15px_rgba(45,212,191,0.6)] overflow-hidden">
                {cat.hoverImageUrl && (
                  <img 
                    src={cat.hoverImageUrl} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none z-0"
                  />
                )}
                <span className="relative z-10 group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors whitespace-nowrap">{cat.name}</span>
              </Link>
            ))}
          </div>

          {isOverflowing && (
            <div className="relative shrink-0 ml-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown) }}
                className={`p-1.5 rounded-lg transition-colors flex items-center ${showDropdown ? 'bg-slate-200 dark:bg-slate-700 text-teal-600 dark:text-teal-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                title="Xem tất cả chủ đề"
              >
                <ChevronDown size={20} className={showDropdown ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>
              
              {showDropdown && (
                <div 
                  className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg py-2 z-50 flex flex-col max-h-[70vh] overflow-y-auto"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="px-4 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/50 mb-1">
                    Tất cả chủ đề ({categories.length})
                  </div>
                  {categories.map(cat => (
                    <Link 
                      key={'dd-' + cat.slug} 
                      href={`/category/${cat.slug}`} 
                      className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-teal-600 dark:text-slate-200 dark:hover:text-teal-400 transition-colors text-sm"
                      onClick={() => setShowDropdown(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
          
        {/* Desktop Menu - User Controls */}
        <div className="hidden md:flex shrink-0 items-center font-medium text-sm">
          {session ? (
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <NotificationDropdown />
              {(session.user.role === "ADMIN" || session.user.role === "ADMIN + FOUNDER") && (
                <Link href="/admin" className="relative text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 flex items-center gap-1 pr-2">
                  <ShieldAlert size={18} /> Admin
                  {adminPendingCount > 0 && (
                    <span className="absolute -top-1 right-0 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </Link>
              )}
              <Link href="/profile" className="flex items-center gap-1 hover:text-teal-500 dark:hover:text-teal-400 transition-colors">
                <UserCircle size={18} /> Profile
              </Link>
              <button onClick={() => signOut()} className="text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-3 py-1 rounded text-slate-900 dark:text-white transition-colors">
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button onClick={() => signIn("google")} className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-1.5 rounded font-bold transition-colors">
                Đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div id="mobile-menu" className={`${isMobileMenuOpen ? "block" : "hidden"} md:hidden mt-4 pb-4 space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4 font-medium`}>
        <div className="flex flex-col gap-4">
          {categories.map(cat => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} onClick={closeMobileMenu} className="hover:text-teal-500 dark:hover:text-teal-400 block px-4">
              {cat.name}
            </Link>
          ))}
          
          <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
          
          {session ? (
            <div className="flex flex-col gap-4 px-4">
              <div className="flex items-center gap-4">
                <ThemeToggle />
              </div>
              <div className="flex items-center gap-2">
                <NotificationDropdown />
                <span className="text-sm text-slate-700 dark:text-slate-300">Thông báo</span>
              </div>
              
              {(session.user.role === "ADMIN" || session.user.role === "ADMIN + FOUNDER") && (
                <Link href="/admin" onClick={closeMobileMenu} className="text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 flex items-center gap-2">
                  <div className="relative">
                    <ShieldAlert size={18} />
                    {adminPendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                    )}
                  </div>
                  Quản trị viên
                </Link>
              )}
              <Link href="/profile" onClick={closeMobileMenu} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors">
                <UserCircle size={18} /> Profile
              </Link>
              <button onClick={() => { closeMobileMenu(); signOut() }} className="w-full text-left text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 py-2">
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 px-4">
              <div className="flex items-center gap-4">
                <ThemeToggle />
              </div>
              <button onClick={() => signIn("google")} className="w-full bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded font-bold transition-colors">
                Đăng nhập bằng Google
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
