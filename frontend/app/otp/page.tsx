"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { Loader2, Mail } from "lucide-react"
import axiosInstance from "@/lib/axios"
import Cookies from "js-cookie"

export default function OTPPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      await axiosInstance.post("/auth/send-otp", { email, password })
      setOtpSent(true)
      setCountdown(60)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!otp) {
      setError("OTP is required")
      return
    }

    setLoading(true)

    try {
      const response = await axiosInstance.post("/auth/verify-otp", { email, otp })
      if (response.data.token) {
        Cookies.set("token", response.data.token, { expires: 7 })
        localStorage.setItem("token", response.data.token)
        router.push("/home")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to verify OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError("")
    setLoading(true)

    try {
      await axiosInstance.post("/auth/send-otp", { email, password })
      setCountdown(60)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Verify Your Email</h1>
          <p className="text-gray-400 mt-2">
            {!otpSent
              ? "Enter your email to receive a verification code"
              : "Enter the 6-digit code sent to your email"
            }
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send OTP
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Time remaining: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
              </p>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
              disabled={loading || countdown > 0}
              onClick={handleResendOTP}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  )
}