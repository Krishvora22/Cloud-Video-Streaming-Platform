"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Check, X } from "lucide-react"
import axiosInstance from "@/lib/axios"

interface User {
  id: string
  email: string
  plan: string
  subscriptionStatus?: string
  currentPeriodEnd?: string
  trialEndsAt?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
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
        <div className="pt-20 px-4 md:px-8 lg:px-12">
          <div className="max-w-2xl space-y-4">
            <div className="h-96 bg-secondary rounded-lg animate-pulse" />
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
          <h1 className="text-2xl font-bold text-foreground">User not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 px-4 md:px-8 lg:px-12 pb-12">
        <div className="max-w-2xl space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Account Settings</h1>
            <p className="text-muted-foreground">Manage your StreamFlix account</p>
          </div>

          {/* Email Section */}
          <div className="bg-secondary rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Email Address</h2>
            <div className="flex items-center gap-4">
              {isEditing ? (
                <>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="flex-1 bg-background text-foreground border-muted"
                  />
                  <Button
                    onClick={handleSaveEmail}
                    disabled={saving}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    size="sm"
                    variant="outline"
                    className="gap-2 bg-transparent border-muted"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-foreground">{user.email}</p>
                    <p className="text-sm text-muted-foreground">Your login email</p>
                  </div>
                  <Button
                    onClick={() => setIsEditing(true)}
                    size="sm"
                    variant="outline"
                    className="gap-2 bg-transparent"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Subscription Section */}
          <div className="bg-secondary rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Subscription</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-lg font-semibold text-foreground capitalize">{user.plan}</p>
                </div>
                {user.plan === "free" ? (
                  <Button
                    onClick={() => router.push("/pricing")}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Upgrade Now
                  </Button>
                ) : (
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                    {user.subscriptionStatus === "active" ? "Active" : "Inactive"}
                  </span>
                )}
              </div>

              {user.plan === "premium" && user.currentPeriodEnd && (
                <div className="pt-4 border-t border-muted">
                  <p className="text-sm text-muted-foreground">Renews on</p>
                  <p className="text-foreground font-medium">{formatDate(user.currentPeriodEnd)}</p>
                </div>
              )}

              {user.plan === "free" && user.trialEndsAt && (
                <div className="pt-4 border-t border-muted">
                  <p className="text-sm text-muted-foreground">Free trial ends on</p>
                  <p className="text-foreground font-medium">{formatDate(user.trialEndsAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
            <p className="text-sm text-foreground">Be careful with these options</p>
            {user.plan === "premium" && (
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10 w-full bg-transparent"
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
