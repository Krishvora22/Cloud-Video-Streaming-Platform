"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, User, Search, Loader2, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Cookies from "js-cookie"
import axiosInstance from "@/lib/axios"
import { useAuth } from "@/hooks/use-auth"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoggedIn } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Scroll listener for navbar opacity
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    Cookies.remove("token")
    localStorage.removeItem("token")
    router.push("/")
  }

  // Debounced search — existing logic preserved
  useEffect(() => {
    if (!isLoggedIn) return // Don't search if not logged in
    const fetchResults = async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true)
        try {
          const res = await axiosInstance.get(`/videos/search?query=${encodeURIComponent(searchQuery)}`)
          if (res.data.success) {
            setResults(res.data.videos)
            setShowDropdown(true)
          }
        } catch (error) {
          setResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setResults([])
        setShowDropdown(false)
      }
    }
    const timer = setTimeout(fetchResults, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, isLoggedIn])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowDropdown(false)
      setIsSearchExpanded(false)
    }
  }

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded)
    if (!isSearchExpanded) {
      setTimeout(() => searchInputRef.current?.focus(), 200)
    } else {
      setSearchQuery("")
      setShowDropdown(false)
    }
  }

  const navLinks = [
    { href: "/home", label: "Home" },
    { href: "/pricing", label: "Pricing" },
    { href: "/my-list", label: "My List" },
  ]

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "glass border-b border-white/[0.06] shadow-lg shadow-black/20"
            : "bg-gradient-to-b from-black/80 to-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href={isLoggedIn ? "/home" : "/"}
            className="text-2xl font-extrabold tracking-wider text-red-600 hover:text-red-500 transition-colors flex-shrink-0"
          >
            STREAMFLIX
          </Link>

          {/* Center nav links — desktop (only when logged in) */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                    pathname === link.href
                      ? "text-white active"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {/* Expandable Search — only when logged in */}
                <div className="relative" ref={dropdownRef}>
                  <form onSubmit={handleSearchSubmit} className="flex items-center">
                    <AnimatePresence>
                      {isSearchExpanded && (
                        <motion.input
                          ref={searchInputRef}
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 220, opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          type="text"
                          placeholder="Titles, genres..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-black/80 border border-white/20 rounded-l-lg py-2 pl-4 pr-2 text-sm text-white placeholder:text-gray-500 focus:border-red-600/50 focus:ring-0 outline-none"
                        />
                      )}
                    </AnimatePresence>
                    <button
                      type="button"
                      onClick={toggleSearch}
                      className={`p-2.5 transition-all duration-300 hover:text-white ${
                        isSearchExpanded
                          ? "text-white bg-black/80 border border-l-0 border-white/20 rounded-r-lg"
                          : "text-gray-400 hover:bg-white/5 rounded-lg"
                      }`}
                    >
                      {isSearchExpanded ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                    </button>
                  </form>

                  {/* Search dropdown results */}
                  <AnimatePresence>
                    {showDropdown && results.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-2 right-0 w-80 glass-card rounded-xl overflow-hidden shadow-2xl shadow-black/60 z-50"
                      >
                        <div className="max-h-80 overflow-y-auto scrollbar-hide">
                          {results.map((video: any) => (
                            <button
                              key={video.id}
                              onClick={() => {
                                router.push(`/watch/${video.id}`)
                                setShowDropdown(false)
                                setIsSearchExpanded(false)
                              }}
                              className="w-full flex items-center gap-3 p-3 hover:bg-white/5 text-left border-b border-white/5 last:border-0 transition-colors"
                            >
                              <Image
                                src={video.thumbnailUrl || "/icon.svg"}
                                alt={video.title}
                                width={72}
                                height={40}
                                className="rounded-md object-cover flex-shrink-0"
                              />
                              <span className="text-white text-sm font-medium truncate">{video.title}</span>
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={handleSearchSubmit}
                          className="w-full p-3 text-center text-sm text-red-500 hover:text-red-400 bg-black/30 hover:bg-black/50 transition-colors font-medium"
                        >
                          See all results for &quot;{searchQuery}&quot;
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile dropdown — desktop */}
                <div className="relative hidden md:block" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-1.5 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-2 right-0 w-48 glass-card rounded-xl overflow-hidden shadow-2xl shadow-black/60 z-50"
                      >
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-red-400 hover:bg-white/5 transition-colors border-t border-white/5"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              /* When NOT logged in: Login + Signup buttons — desktop */
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:text-white hover:bg-white/5 font-medium rounded-lg px-5 transition-all duration-300 hover:scale-105"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg px-6 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-red-600/20">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-in menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-72 glass z-50 md:hidden border-l border-white/[0.06] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                <span className="text-lg font-bold text-red-600">STREAMFLIX</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isLoggedIn ? (
                <>
                  {/* Logged-in mobile nav */}
                  <div className="flex-1 py-4 space-y-1 px-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          pathname === link.href
                            ? "bg-white/10 text-white"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-white/[0.06] p-2 space-y-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-white/5 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Not logged-in mobile nav */}
                  <div className="flex-1 py-4 space-y-1 px-2">
                    <Link
                      href="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      Home
                    </Link>
                    <Link
                      href="/pricing"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      Pricing
                    </Link>
                  </div>

                  <div className="border-t border-white/[0.06] p-4 space-y-3">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 font-medium rounded-xl py-5"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl py-5 shadow-lg shadow-red-600/20">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}