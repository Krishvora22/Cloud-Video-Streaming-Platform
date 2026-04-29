"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageTransition } from "@/components/page-transition"
import { Edit2, Check, X, User, CreditCard, AlertTriangle, Shield } from "lucide-react"
import { motion } from "framer-motion"
import axiosInstance from "@/lib/axios"

interface UserData {
  id: string
  email: string
  plan: string
  subscriptionStatus?: string
  currentPeriodEnd?: string
  trialEndsAt?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get("/user/current")
        if (response.data.user) {
          setUser(response.data.user)
          setNewEmail(response.data.user.email)
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleSaveEmail = async () => {
    if (!newEmail || newEmail === user?.email) {
      setIsEditing(false)
      return
    }

    setSaving(true)

    try {
      const response = await axiosInstance.patch("/user/profile", {
        email: newEmail.toLowerCase(),
      })

      if (response.data.user) {
        setUser(response.data.user)
        setIsEditing(false)
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update email")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setNewEmail(user?.email || "")
    setIsEditing(false)
  }

  const formatDate = (date?: string) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4 md:px-8 lg:px-12 max-w-2xl mx-auto">
          <div className="space-y-6">
            <div className="h-8 w-64 skeleton-shimmer rounded-lg" />
            <div className="h-48 skeleton-shimmer rounded-2xl" />
            <div className="h-64 skeleton-shimmer rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">User not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageTransition>
        <div className="pt-24 px-4 md:px-8 lg:px-12 pb-16 max-w-2xl mx-auto">
          <div className="space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-600/20">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Account Settings</h1>
                  <p className="text-gray-500">Manage your StreamFlix account</p>
                </div>
              </div>
            </motion.div>

            {/* Email section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-white">Email Address</h2>
              </div>
              <div className="flex items-center gap-4">
                {isEditing ? (
                  <>
                    <Input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="flex-1 bg-white/5 border-white/10 text-white h-11 rounded-xl focus:border-red-600/50"
                    />
                    <Button
                      onClick={handleSaveEmail}
                      disabled={saving}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white gap-2 rounded-xl"
                    >
                      <Check className="w-4 h-4" />
                      {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      size="sm"
                      variant="outline"
                      className="gap-2 bg-transparent border-white/10 text-white rounded-xl hover:bg-white/5"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="text-white font-medium">{user.email}</p>
                      <p className="text-sm text-gray-500">Your login email</p>
                    </div>
                    <Button
                      onClick={() => setIsEditing(true)}
                      size="sm"
                      variant="outline"
                      className="gap-2 bg-white/5 border-white/10 text-white rounded-xl hover:bg-white/10"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </motion.div>

            {/* Subscription section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card rounded-2xl p-6 space-y-6"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-white">Subscription</h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Current Plan</p>
                    <p className="text-xl font-bold text-white capitalize">{user.plan}</p>
                  </div>
                  {user.plan === "free" ? (
                    <Button
                      onClick={() => router.push("/pricing")}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20"
                    >
                      Upgrade Now
                    </Button>
                  ) : (
                    <span className="px-4 py-1.5 bg-green-500/10 text-green-400 rounded-full text-sm font-medium border border-green-500/20">
                      {user.subscriptionStatus === "active" ? "Active" : "Inactive"}
                    </span>
                  )}
                </div>

                {user.plan === "premium" && user.currentPeriodEnd && (
                  <div className="pt-4 border-t border-white/[0.06]">
                    <p className="text-sm text-gray-500">Renews on</p>
                    <p className="text-white font-medium">{formatDate(user.currentPeriodEnd)}</p>
                  </div>
                )}

                {user.plan === "free" && user.trialEndsAt && (
                  <div className="pt-4 border-t border-white/[0.06]">
                    <p className="text-sm text-gray-500">Free trial ends on</p>
                    <p className="text-white font-medium">{formatDate(user.trialEndsAt)}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Danger zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-2xl p-6 space-y-4 border border-red-500/10 bg-red-500/[0.02]"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
              </div>
              <p className="text-sm text-gray-400">Be careful with these options</p>
              {user.plan === "premium" && (
                <Button
                  variant="outline"
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10 w-full bg-transparent rounded-xl"
                >
                  Cancel Subscription
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </div>
  )
}
