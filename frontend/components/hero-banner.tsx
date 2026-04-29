"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Play, Plus, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import axiosInstance from "@/lib/axios"

interface HeroVideo {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string | null
}

export function HeroBanner() {
  const [video, setVideo] = useState<HeroVideo | null>(null)
  const [loading, setLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<any | null>(null)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await axiosInstance.get("/videos/featured")
        if (Array.isArray(response.data.videos)) {
          const randomIndex = Math.floor(Math.random() * response.data.videos.length)
          setVideo(response.data.videos[randomIndex])
        } else if (response.data.video) {
          setVideo(response.data.video)
        }
      } catch (error) {
        console.error("Failed to fetch featured video:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement || loading || !video) return

    let didCancel = false

    const setupVideo = async () => {
      const sourceUrl = video.videoUrl
      if (!sourceUrl || typeof sourceUrl !== "string" || sourceUrl.trim() === "") {
        console.error("Invalid video URL:", sourceUrl)
        return
      }

      try {
        const { default: Hls } = await import("hls.js")
        if (didCancel) return

        if (Hls.isSupported()) {
          if (hlsRef.current) {
            hlsRef.current.destroy()
          }

          const hls = new Hls({
            xhrSetup: (xhr) => {
              xhr.withCredentials = false
            },
          })

          hlsRef.current = hls
          hls.loadSource(sourceUrl)
          hls.attachMedia(videoElement)

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoElement.play().catch((err) => console.log("Autoplay blocked:", err))
          })

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.error("HLS Error:", data.type)
              videoElement.style.opacity = "0"
            }
          })
        } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
          videoElement.src = sourceUrl
        }
      } catch (error) {
        console.error("Failed to load HLS library:", error)
      }
    }

    setupVideo()

    return () => {
      didCancel = true
      hlsRef.current?.destroy()
    }
  }, [loading, video])

  if (loading || !video) {
    return (
      <div className="relative h-[50vh] md:h-[85vh] overflow-hidden">
        <div className="absolute inset-0 skeleton-shimmer rounded-none" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16 space-y-4">
          <div className="h-10 w-80 skeleton-shimmer rounded-lg" />
          <div className="h-4 w-96 skeleton-shimmer rounded-lg" />
          <div className="h-4 w-72 skeleton-shimmer rounded-lg" />
          <div className="flex gap-4 mt-6">
            <div className="h-12 w-40 skeleton-shimmer rounded-xl" />
            <div className="h-12 w-40 skeleton-shimmer rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[50vh] md:h-[85vh] overflow-hidden">
      {/* Background video with Ken Burns */}
      <div className="absolute inset-0 animate-kenburns origin-center">
        <video
          key={video.id}
          ref={videoRef}
          poster={video.thumbnailUrl || undefined}
          muted
          loop
          playsInline
          preload="metadata"
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Multi-layer gradient overlays for cinematic feel */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-transparent to-black/30" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0b0b0b] to-transparent" />

      {/* Content overlay with staggered animations */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-16 lg:p-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-2xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-2xl"
          >
            {video.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-sm md:text-base lg:text-lg text-gray-300 mb-8 max-w-xl line-clamp-3 leading-relaxed"
          >
            {video.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="flex flex-wrap gap-3"
          >
            <Link href={`/watch/${video.id}`}>
              <Button className="bg-white hover:bg-white/90 text-black gap-2.5 px-7 py-6 text-base font-bold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl">
                <Play className="w-5 h-5 fill-current" />
                Watch Now
              </Button>
            </Link>
            <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white gap-2.5 px-7 py-6 text-base font-semibold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm"
            >
              <Plus className="w-5 h-5" />
              My List
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Vignette edges */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.5)]" />
    </div>
  )
}