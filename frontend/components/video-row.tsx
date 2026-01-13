"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Compass } from "lucide-react" // Added Compass icon
import { VideoCard } from "./video-card"
import { Button } from "@/components/ui/button" // Added Button import
import Link from "next/link" // Added Link import
import axiosInstance from "@/lib/axios"

interface Video {
  id: string
  title: string
  thumbnailUrl: string | null
  views: number
}

interface VideoRowProps {
  title: string
  endpoint: string
}

export function VideoRow({ title, endpoint }: VideoRowProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axiosInstance.get(endpoint)
        if (response.data.videos || response.data.history) {
          setVideos(response.data.videos || response.data.history)
        }
      } catch (error) {
        console.error(`Failed to fetch videos from ${endpoint}:`, error)
      } finally {
        setLoading(false)
      }
    }
    fetchVideos()
  }, [endpoint])

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById(`scroll-${title}`)
    if (container) {
      const scrollAmount = 400
      const newPosition = direction === "left" ? scrollPosition - scrollAmount : scrollPosition + scrollAmount
      container.scrollTo({
        left: newPosition,
        behavior: "smooth",
      })
      setScrollPosition(newPosition)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
        <div className="flex gap-4 overflow-x-hidden">
          {[...Array(5)].map((_, i) => (
            // FIX: Match aspect-video to prevent layout shift
            <div key={i} className="aspect-video w-64 bg-secondary rounded-lg flex-shrink-0 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // FIX: Empty State logic
  if (!videos.length) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
        <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-secondary/10 space-y-4">
          <p className="text-muted-foreground">No videos available in {title}</p>
          <Link href="/home">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent border-muted hover:bg-secondary">
              <Compass className="w-4 h-4" />
              Explore Content
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
      <div className="relative group">
        <div id={`scroll-${title}`} className="flex gap-4 overflow-x-hidden scroll-smooth">
          {videos.map((video) => (
            <div key={video.id} className="flex-shrink-0 w-64">
              <VideoCard id={video.id} title={video.title} thumbnail={video.thumbnailUrl} views={video.views} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -ml-4"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -mr-4"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}