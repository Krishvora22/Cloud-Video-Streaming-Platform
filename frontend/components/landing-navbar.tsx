"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function LandingNavbar() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-[#0b0b0b]/80 backdrop-blur-xl border-b border-white/[0.05] shadow-2xl shadow-black/50"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 hover:from-red-500 hover:to-red-300 transition-all flex-shrink-0"
          >
            STREAMFLIX
          </Link>

          {/* Center links — desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              className={`px-5 py-2.5 text-sm font-semibold transition-all duration-300 rounded-full ${
                pathname === "/" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className={`px-5 py-2.5 text-sm font-semibold transition-all duration-300 rounded-full ${
                pathname === "/pricing" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Pricing
            </Link>
          </div>

          {/* Right side: Login + Signup — desktop */}
          <div className="hidden md:flex items-center gap-4">
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

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
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

              <div className="flex-1 py-4 space-y-1 px-2">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    pathname === "/"
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    pathname === "/pricing"
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
