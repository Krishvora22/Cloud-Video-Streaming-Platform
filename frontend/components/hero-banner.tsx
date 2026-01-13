"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import axiosInstance from "@/lib/axios"
import Hls from "hls.js"

interface HeroVideo {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string | null
}

export function HeroBanner() {
  // We keep the state as a single video object so the rest of the UI stays identical
  const [video, setVideo] = useState<HeroVideo | null>(null)
  const [loading, setLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await axiosInstance.get("/videos/featured")
        
        // If your backend returns an array of featured videos, pick one randomly
        // This ensures the "dynamic" feel every time the page loads
        if (Array.isArray(response.data.videos)) {
          const randomIndex = Math.floor(Math.random() * response.data.videos.length)
          setVideo(response.data.videos[randomIndex])
        } else if (response.data.video) {
          // Fallback if it only returns one
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

    // Standardize URL - Using the dynamic videoUrl from state
    const sourceUrl = video.videoUrl
    
    if (Hls.isSupported()) {
      // Clean up previous HLS instance if it exists
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }

      const hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        }
      })
      
      hlsRef.current = hls
      hls.loadSource(sourceUrl)
      hls.attachMedia(videoElement)
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement.play().catch((err) => console.log("Autoplay blocked:", err))
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("HLS Error:", data.type);
          videoElement.style.opacity = "0"; 
        }
      })

      return () => {
        hls.destroy()
      }
    } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
      videoElement.src = sourceUrl
    }
  }, [loading, video]) // Re-run when video object changes

  if (loading || !video) {
    return <div className="h-96 md:h-[500px] bg-secondary animate-pulse rounded-lg mx-4" />
  }

  return (
    <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden mx-4 bg-black group">
      {/* BACKGROUND VIDEO LAYER */}
      <video
        key={video.id} // Key ensures React re-mounts the video tag when the ID changes
        ref={videoRef}
        poster={video.thumbnailUrl || undefined}
        muted
        loop
        playsInline
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-1000 animate-in fade-in"
      />

      {/* UI OVERLAY - NO CHANGES HERE */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 text-white">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 max-w-2xl drop-shadow-xl animate-in fade-in slide-in-from-left-4 duration-700">
          {video.title}
        </h1>
        <p className="text-sm md:text-base text-gray-300 mb-8 max-w-2xl line-clamp-3 drop-shadow-md">
          {video.description}
        </p>

        <div className="flex gap-4">
          <Link href={`/watch/${video.id}`}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8 py-6 text-lg font-semibold transition-transform active:scale-95">
              <Play className="w-5 h-5 fill-current" />
              Watch Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}