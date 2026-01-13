"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, User, Search, Loader2 } from "lucide-react"
import Cookies from "js-cookie"
import axiosInstance from "@/lib/axios"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    Cookies.remove("token") // Required for proxy.ts
    localStorage.removeItem("token")
    router.push("/login")
  }

  useEffect(() => {
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
  }, [searchQuery])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowDropdown(false)
    }
  }

  const navLinks = [
    { href: "/home", label: "Home" },
    { href: "/pricing", label: "Pricing" },
    { href: "/my-list", label: "My List" },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/home" className="text-2xl font-bold text-red-600">STREAMFLIX</Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} 
              className={`text-sm font-medium transition-colors ${pathname === link.href ? "text-white" : "text-gray-400 hover:text-white"}`}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex-1 max-w-sm relative" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/50 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-red-600 outline-none"
            />
          </form>

          {showDropdown && results.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
              {results.map((video: any) => (
                <button key={video.id} onClick={() => router.push(`/watch/${video.id}`)} 
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/5 text-left border-b border-white/5 last:border-0">
                  <img src={video.thumbnailUrl} className="w-16 h-9 object-cover rounded" alt="" />
                  <span className="text-white text-sm font-medium truncate">{video.title}</span>
                </button>
              ))}
              <button onClick={handleSearchSubmit} className="w-full p-2 text-center text-xs text-red-500 bg-black/20">
                See all results for "{searchQuery}"
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/profile"><Button variant="ghost" size="sm"><User className="w-5 h-5" /></Button></Link>
          <Button onClick={handleLogout} variant="ghost" size="sm"><LogOut className="w-5 h-5" /></Button>
        </div>
      </div>
    </nav>
  )
}