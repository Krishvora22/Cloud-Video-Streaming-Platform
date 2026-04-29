"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LandingHero } from "@/components/landing-hero"
import { Features } from "@/components/features"
import { LandingNavbar } from "@/components/landing-navbar"
import { useAuth } from "@/hooks/use-auth"
import { ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

export default function LandingPage() {
  const router = useRouter()
  const { isLoggedIn, isLoading } = useAuth()

  // If logged in, redirect to /home
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      window.location.href = "/home"
    }
  }, [isLoggedIn, isLoading, router])

  // Show nothing while checking auth to prevent flash
  if (isLoading || isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b]">
      {/* Landing-only navbar (no search, no profile) */}
      <LandingNavbar />

      {/* Hero */}
      <LandingHero />

      {/* Features */}
      <Features />

      {/* CTA Banner */}
      <section className="relative py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Start Watching?
            </h2>
            <p className="text-gray-500 text-lg">
              Create your account in seconds. No credit card required.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white px-10 py-6 text-base font-bold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-red-600/25 gap-2 w-full sm:w-auto"
              >
                Get Started Free
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-wider text-red-600">STREAMFLIX</span>
            </div>

            <div className="flex items-center gap-8 text-sm text-gray-600">
              <Link href="/pricing" className="hover:text-gray-400 transition-colors">
                Pricing
              </Link>
              <Link href="/login" className="hover:text-gray-400 transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="hover:text-gray-400 transition-colors">
                Sign Up
              </Link>
            </div>

            <p className="text-gray-700 text-xs">
              &copy; {new Date().getFullYear()} StreamFlix. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
