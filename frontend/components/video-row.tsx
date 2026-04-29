"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Compass, Film } from "lucide-react"
import { VideoCard } from "./video-card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import axiosInstance from "@/lib/axios"

interface Video {
  id: string
  title: string
  thumbnailUrl: string | null
  views: number
  progress?: number
}

interface VideoRowProps {
  title: string
  endpoint: string
}

export function VideoRow({ title, endpoint }: VideoRowProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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

  const updateArrows = () => {
    const container = scrollContainerRef.current
    if (!container) return
    setShowLeftArrow(container.scrollLeft > 20)
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 20
    )
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    container.addEventListener("scroll", updateArrows, { passive: true })
    updateArrows()
    return () => container.removeEventListener("scroll", updateArrows)
  }, [videos])

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (!container) return
    const scrollAmount = container.clientWidth * 0.75
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-48 skeleton-shimmer rounded-md" />
        <div className="flex gap-3 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="aspect-video w-[240px] md:w-[280px] skeleton-shimmer rounded-xl flex-shrink-0"
            />
          ))}
        </div>
      </div>
    )
  }

  if (!videos.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <h2 className="text-xl md:text-2xl font-bold text-white">
          {title}
        </h2>
        <div className="py-16 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.04] space-y-5">
          <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <Film className="w-9 h-9 text-gray-600" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-gray-400 font-medium">Nothing here yet</p>
            <p className="text-gray-600 text-sm">Explore our catalog and add content to your list</p>
          </div>
          <Link href="/home">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg transition-all hover:scale-105"
            >
              <Compass className="w-4 h-4" />
              Explore Content
            </Button>
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="space-y-3"
    >
      {/* Section title */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-red-600 rounded-full" />
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          {title}
        </h2>
      </div>

      {/* Scrollable row with gradient edges */}
      <div className="relative group/row">
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0b0b0b] to-transparent z-10 pointer-events-none opacity-0 transition-opacity duration-300"
          style={{ opacity: showLeftArrow ? 1 : 0 }}
        />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0b0b0b] to-transparent z-10 pointer-events-none opacity-0 transition-opacity duration-300"
          style={{ opacity: showRightArrow ? 1 : 0 }}
        />

        {/* Scroll container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide py-2 -my-2 px-1"
        >
          {videos.map((video) => (
            <div key={video.id} className="flex-shrink-0 w-[200px] sm:w-[240px] md:w-[280px]">
              <VideoCard
                id={video.id}
                title={video.title}
                thumbnail={video.thumbnailUrl}
                views={video.views}
                progress={video.progress}
              />
            </div>
          ))}
        </div>

        {/* Scroll arrows */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/70 hover:bg-black/90 backdrop-blur-sm text-white rounded-full opacity-0 group-hover/row:opacity-100 transition-all duration-300 border border-white/10 hover:border-white/20 hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/70 hover:bg-black/90 backdrop-blur-sm text-white rounded-full opacity-0 group-hover/row:opacity-100 transition-all duration-300 border border-white/10 hover:border-white/20 hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  )
}