"use client"

import React, { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { HLSPlayer } from "@/components/hls-player"
import { VideoRow } from "@/components/video-row"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import axiosInstance from "@/lib/axios"

interface Video {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  views: number
  uploader: {
    email: string
  }
  duration: number
  category: string
}

export default function WatchPage() {
  const params = useParams()
  const videoId = params.id as string

  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [startTime, setStartTime] = useState(0)

  // Refs for logic that shouldn't trigger re-renders
  const lastUpdatedTimeRef = useRef<number>(0)
  const hasIncrementedViewRef = useRef<boolean>(false)

  useEffect(() => {
    const fetchAllData = async () => {
      if (!videoId) return;
      
      try {
        setLoading(true)
        // Reset the view trigger ref when the video ID changes
        hasIncrementedViewRef.current = false;

        // 1. Fetch data in parallel
        // Note: View increment is REMOVED from here to prevent counting on simple page refresh
        const [videoRes, historyRes, watchlistRes] = await Promise.all([
          axiosInstance.get(`/videos/${videoId}`),
          axiosInstance.get(`/history/${videoId}`).catch(() => ({ data: null })),
          axiosInstance.get(`/watchlist/check/${videoId}`).catch(() => ({ data: { isInWatchlist: false } }))
        ])

        setVideo(videoRes.data.video)
        
        if (historyRes.data?.progress) {
          setStartTime(historyRes.data.progress)
        }

        setIsInWatchlist(watchlistRes.data.isInWatchlist)

      } catch (err) {
        console.error("Error loading video data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [videoId])

  const handleWatchlistToggle = async () => {
    try {
      const previousState = isInWatchlist;
      setIsInWatchlist(!previousState);
      await axiosInstance.post(`/watchlist`, { videoId });
    } catch (err) {
      console.error("Failed to toggle watchlist:", err);
      // Revert UI state if API fails
      setIsInWatchlist((prev) => !prev);
    }
  }

  const handleProgress = (progress: number, duration: number) => {
    const currentTime = Date.now()

    // --- LOGIC: PER USER ONE VIEW COUNT ---
    // Trigger only once per video session when user hits 30 seconds of playback
    if (!hasIncrementedViewRef.current && progress >= 30) {
      hasIncrementedViewRef.current = true;
      
      // Backend should check userId + videoId to ensure truly only one view ever
      axiosInstance.post(`/videos/${videoId}/view`).catch((err) => {
        console.log("View record skipped or already exists", err);
      });
    }

    // --- LOGIC: SYNC WATCH HISTORY ---
    // Update progress in database every 10 seconds to avoid server overload
    if (currentTime - lastUpdatedTimeRef.current > 10000) {
      lastUpdatedTimeRef.current = currentTime
      axiosInstance.post("/history/progress", {
        videoId,
        progress: Math.floor(progress),
        duration: Math.floor(duration),
      }).catch(err => console.error("Failed to update history:", err))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 px-6">
          <div className="aspect-video bg-neutral-900 animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <h1 className="text-xl font-bold">Video not found</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 px-4 md:px-8 lg:px-12 space-y-8">
        {/* Main Player Container */}
        <div className="relative w-full aspect-video max-h-[70vh] bg-black rounded-lg overflow-hidden border border-white/5 shadow-2xl">
          <HLSPlayer
            src={video.videoUrl}
            poster={video.thumbnailUrl || undefined}
            onProgress={handleProgress}
            initialTime={startTime}
          />
        </div>

        {/* Video Information */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{video.title}</h1>
              <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                <span>{video.views.toLocaleString()} views</span>
                <div className="w-1 h-1 rounded-full bg-neutral-600" />
                <span className="px-3 py-1 text-xs font-medium bg-neutral-800 text-white rounded-full">
                  {video.category}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isInWatchlist ? "secondary" : "outline"}
                onClick={handleWatchlistToggle}
                className={`gap-2 transition-all duration-300 ${
                  isInWatchlist ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20" : ""
                }`}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${isInWatchlist ? "fill-red-500 stroke-red-500" : ""}`}
                />
                {isInWatchlist ? "In List" : "Add to List"}
              </Button>
            </div>
          </div>

          {/* Video Description */}
          <div className="bg-neutral-900/50 p-6 rounded-xl border border-white/5">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-muted-foreground leading-relaxed">{video.description}</p>
          </div>
        </div>

        {/* Recommendations */}
        <VideoRow title="Related Videos" endpoint={`/videos/${videoId}/related`} />
      </div>
    </div>
  )
}