"use client"

import React, { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { HLSPlayer } from "@/components/hls-player"
import { VideoRow } from "@/components/video-row"
import { Button } from "@/components/ui/button"
import { ShareModal } from "@/components/share-modal"
import { PageTransition } from "@/components/page-transition"
import { Heart, Eye, Tag } from "lucide-react"
import { motion } from "framer-motion"
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

  const lastUpdatedTimeRef = useRef<number>(0)
  const hasIncrementedViewRef = useRef<boolean>(false)

  useEffect(() => {
    const fetchAllData = async () => {
      if (!videoId) return

      try {
        setLoading(true)
        hasIncrementedViewRef.current = false

        const [videoRes, historyRes, watchlistRes] = await Promise.all([
          axiosInstance.get(`/videos/${videoId}`),
          axiosInstance.get(`/history/${videoId}`).catch(() => ({ data: null })),
          axiosInstance.get(`/watchlist/check/${videoId}`).catch(() => ({ data: { isInWatchlist: false } })),
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
      const previousState = isInWatchlist
      setIsInWatchlist(!previousState)
      await axiosInstance.post(`/watchlist`, { videoId })
    } catch (err) {
      console.error("Failed to toggle watchlist:", err)
      setIsInWatchlist((prev) => !prev)
    }
  }

  const handleProgress = (progress: number, duration: number) => {
    const currentTime = Date.now()

    if (!hasIncrementedViewRef.current && progress >= 30) {
      hasIncrementedViewRef.current = true
      axiosInstance.post(`/videos/${videoId}/view`).catch((err) => {
        console.log("View record skipped or already exists", err)
      })
    }

    if (currentTime - lastUpdatedTimeRef.current > 10000) {
      lastUpdatedTimeRef.current = currentTime
      axiosInstance
        .post("/history/progress", {
          videoId,
          progress: Math.floor(progress),
          duration: Math.floor(duration),
        })
        .catch((err) => console.error("Failed to update history:", err))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 px-4 md:px-8 lg:px-12 max-w-[1400px] mx-auto space-y-6">
          <div className="aspect-video skeleton-shimmer rounded-2xl" />
          <div className="space-y-3">
            <div className="h-8 w-96 skeleton-shimmer rounded-lg" />
            <div className="h-4 w-64 skeleton-shimmer rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <h1 className="text-xl font-bold text-white">Video not found</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageTransition>
        <div className="pt-20 px-4 md:px-8 lg:px-12 max-w-[1400px] mx-auto space-y-8 pb-16">
          {/* Player */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-full aspect-video max-h-[75vh] bg-black rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/50"
          >
            <HLSPlayer
              src={video.videoUrl}
              poster={video.thumbnailUrl || undefined}
              onProgress={handleProgress}
              initialTime={startTime}
            />
          </motion.div>

          {/* Video info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{video.title}</h1>
                <div className="flex items-center gap-4 mt-3 text-gray-400">
                  <span className="flex items-center gap-1.5 text-sm">
                    <Eye className="w-4 h-4" />
                    {video.views.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1.5 text-sm">
                    <Tag className="w-4 h-4" />
                    <span className="px-3 py-1 text-xs font-medium bg-white/5 text-gray-300 rounded-full border border-white/10">
                      {video.category}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Button
                  variant={isInWatchlist ? "secondary" : "outline"}
                  onClick={handleWatchlistToggle}
                  className={`gap-2 rounded-xl transition-all duration-300 ${
                    isInWatchlist
                      ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 transition-all duration-300 ${
                      isInWatchlist ? "fill-red-500 stroke-red-500 scale-110" : ""
                    }`}
                  />
                  {isInWatchlist ? "In My List" : "Add to List"}
                </Button>
                <ShareModal videoId={videoId} />
              </div>
            </div>

            {/* Description */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">About</h2>
              <p className="text-gray-300 leading-relaxed">{video.description}</p>
            </div>
          </motion.div>

          {/* Related */}
          <div className="pt-4">
            <VideoRow title="Related Videos" endpoint={`/videos/${videoId}/related`} />
          </div>
        </div>
      </PageTransition>
    </div>
  )
}