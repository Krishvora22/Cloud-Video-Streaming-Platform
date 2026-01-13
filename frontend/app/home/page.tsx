"use client"

import React, { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { HeroBanner } from "@/components/hero-banner"
import { VideoRow } from "@/components/video-row"
import axiosInstance from "@/lib/axios"

export default function HomePage() {
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    // Fetch the list of categories dynamically from the backend
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/videos/categories")
        // Expected format: { categories: ["Action", "Sci-Fi", "Drama"] }
        setCategories(res.data.categories || [])
      } catch (err) {
        console.error("Failed to load categories", err)
      }
    }
    fetchCategories()
  }, [])

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      {/* Hero Section - Showcases featured content */}
      <div className="pt-20 px-4 md:px-8 lg:px-12">
        <HeroBanner />
      </div>

      {/* Main Content: Video Rows */}
      <div className="px-4 md:px-8 lg:px-12 py-12 space-y-16">
        {/* Priority Rows */}
        <VideoRow title="Trending Now" endpoint="/videos" />
        <VideoRow title="Continue Watching" endpoint="/history" />

        {/* Dynamic Category Rows based on API data */}
        {categories.map((cat) => (
          <VideoRow 
            key={cat} 
            title={cat} 
            endpoint={`/videos?category=${cat}`} 
          />
        ))}
      </div>
    </div>
  )
}