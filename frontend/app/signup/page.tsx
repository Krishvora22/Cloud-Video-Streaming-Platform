"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import axiosInstance from "@/lib/axios"
import Cookies from "js-cookie"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const response = await axiosInstance.post("/auth/signup", {
        email: email.toLowerCase(),
        password,
        role: "USER",
      })

      if (response.data.token) {
        Cookies.set("token", response.data.token, { expires: 7 })
        localStorage.setItem("token", response.data.token)
        router.push("/home")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to sign up")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#050505] flex-col lg:flex-row">
      {/* MOBILE Visual Snippet (Only visible on small screens to replace heavy graphics) */}
      <div className="lg:hidden w-full px-6 pt-12 pb-6 text-center space-y-3 z-10 relative">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 inline-block">
          STREAMFLIX
        </h1>
        <p className="text-gray-400 text-sm">Watch anywhere. Cancel anytime.</p>
        <div className="absolute inset-x-0 bottom-0 top-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-[#050505] to-[#050505]" />
      </div>

      {/* LEFT SIDE - 45% (Auth Form) */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 xl:px-24 z-20 relative bg-[#050505] shadow-[20px_0_50px_rgba(0,0,0,0.6)]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[400px] mx-auto relative z-10"
        >
          {/* Logo (Desktop Only) */}
          <Link href="/" className="hidden lg:block mb-12">
            <h1 className="text-2xl font-black tracking-widest text-[#dc2626] opacity-90 transition-opacity hover:opacity-100">
              STREAMFLIX
            </h1>
          </Link>

          {/* Form Header */}
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Create Account</h2>
            <p className="text-gray-400 text-sm font-medium">Start your brilliant cinematic journey.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/[0.03] border-white/5 text-white placeholder:text-gray-600 h-14 px-4 rounded-xl focus:bg-white/[0.05] focus:border-red-500/30 focus:ring-1 focus:ring-red-500/30 transition-all text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/[0.03] border-white/5 text-white placeholder:text-gray-600 h-14 px-4 pr-12 rounded-xl focus:bg-white/[0.05] focus:border-red-500/30 focus:ring-1 focus:ring-red-500/30 transition-all text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-white/[0.03] border-white/5 text-white placeholder:text-gray-600 h-14 px-4 rounded-xl focus:bg-white/[0.05] focus:border-red-500/30 focus:ring-1 focus:ring-red-500/30 transition-all text-base"
                />
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-[#ef4444] text-sm p-3 rounded-lg flex items-center justify-center font-medium overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#dc2626] hover:bg-[#e11d48] hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] text-white text-base font-bold rounded-xl transition-all duration-300 disabled:opacity-50 border border-transparent"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
              </Button>
            </div>
          </form>

          {/* Footer Text */}
          <div className="mt-8 text-center sm:text-left">
            <p className="text-gray-500 text-sm font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-white hover:text-gray-200 font-bold transition-colors underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* RIGHT SIDE - 55% (Cinematic Visual - Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-[#0b0b0f] items-center justify-center">
        {/* Option A: Blurred Movie Poster Collage Backdrop */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 w-[150%] h-[150%] -rotate-12 -translate-y-20 -translate-x-10 opacity-70 blur-[8px]">
            {/* Simulating movie posters with varying gradient colors */}
            {[...Array(30)].map((_, i) => {
              const gradients = [
                "from-blue-900 to-indigo-900",
                "from-red-900 to-red-800",
                "from-purple-900 to-violet-900",
                "from-indigo-900 to-cyan-900",
                "from-black to-neutral-900",
                "from-orange-900 to-red-900",
              ]
              const randomGradient = gradients[i % gradients.length]
              return (
                <div
                  key={i}
                  className={`aspect-[2/3] w-full rounded-md bg-gradient-to-br ${randomGradient} shadow-xl transform transition-transform`}
                />
              )
            })}
          </div>
          {/* Heavy Dark Gradient Overlay mapping back to True Dark */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-[#0b0b0f]/80 to-[#0b0b0f]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0f] via-transparent to-transparent" />
        </div>

        {/* Central Focus Container */}
        <div className="relative z-10 w-full max-w-xl px-12 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
            className="w-full"
          >
            <h1
              className="text-5xl xl:text-[4rem] leading-[1.15] font-black tracking-tight text-transparent bg-clip-text animate-text-pan-slow pb-1 mx-auto max-w-[500px]"
              style={{
                backgroundImage: "linear-gradient(to right, #ec4899, #8b5cf6, #3b82f6, #ec4899)",
                backgroundSize: "200% auto",
              }}
            >
              Unlimited Movies, TV Shows &amp; More
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-sm md:text-base text-gray-400 mt-5 font-medium tracking-wide uppercase max-w-sm mx-auto opacity-70"
          >
            Watch anywhere. Cancel anytime.
          </motion.p>
        </div>
      </div>
    </div>
  )
}
