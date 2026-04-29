"use client"

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { VideoRow } from "@/components/video-row"
import { PageTransition } from "@/components/page-transition"
import { useAuth } from "@/hooks/use-auth"
import axiosInstance from "@/lib/axios"

const HeroBanner = dynamic(
  () => import("@/components/hero-banner").then((mod) => mod.HeroBanner),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[50vh] bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
)

export default function HomePage() {
  const router = useRouter()
  const { isLoggedIn, isLoading } = useAuth()
  const [categories, setCategories] = useState<string[]>([])

  // Redirect to landing if not logged in
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      window.location.href = "/"
    }
  }, [isLoggedIn, isLoading, router])

  useEffect(() => {
    if (!isLoggedIn) return
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/videos/categories")
        setCategories(res.data.categories || [])
      } catch (err) {
        console.error("Failed to load categories", err)
      }
    }
    fetchCategories()
  }, [isLoggedIn])

  // Show loading while checking auth
  if (isLoading || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageTransition>
        {/* Hero Section — full bleed, no padding */}
        <div className="pt-16">
          <HeroBanner />
        </div>

        {/* Content Rows */}
        <div className="px-4 md:px-8 lg:px-12 py-12 space-y-12 max-w-[1600px] mx-auto">
          <VideoRow title="Trending Now" endpoint="/videos" />
          <VideoRow title="Continue Watching" endpoint="/history" />

          {categories.map((cat) => (
            <VideoRow
              key={cat}
              title={cat}
              endpoint={`/videos?category=${cat}`}
            />
          ))}
        </div>
      </PageTransition>
    </div>
  )
}