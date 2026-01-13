"use client"

import { Navbar } from "@/components/navbar"
import { VideoRow } from "@/components/video-row"

export default function MyListPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 px-4 md:px-8 lg:px-12 pb-12 space-y-10">
        {/* Header Section */}
        <div className="border-b border-white/5 pb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">My List</h1>
          <p className="text-muted-foreground">
            Your collection of movies and shows to watch later.
          </p>
        </div>

        {/* Watchlist Content */}
        {/* Note: If endpoint returns [], VideoRow will show the "No videos found" UI */}
        <VideoRow title="Your Watchlist" endpoint="/watchlist" />
      </div>
    </div>
  )
}