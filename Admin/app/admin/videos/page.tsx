"use client"

import { useEffect, useState } from "react"
import { useAdmin } from "@/lib/admin-context"
import VideoHeader from "@/components/admin/video-header"
import VideoList from "@/components/admin/video-list"
import UploadModal from "@/components/admin/upload-modal"

interface Video {
  id: string
  title: string
  description: string
  category: string
  thumbnailUrl: string
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  views: number
  createdAt: string
  uploader: { id: string; email: string }
}

export default function VideosPage() {
  const { token } = useAdmin()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()

  useEffect(() => {
    if (!token) return

    async function fetchVideos() {
      try {
        setLoading(true)
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/videos`)
        if (selectedCategory) url.searchParams.append("category", selectedCategory)

        const response = await fetch(url.toString(), {
          credentials: "include",
        })
        if (!response.ok) throw new Error("Failed to fetch videos")
        const data = await response.json()
        setVideos(data.videos)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch videos")
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [token, selectedCategory])

  const handleVideoUploaded = async () => {
    setUploadOpen(false)
    // Refetch videos
    if (token) {
      try {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/videos`)
        if (selectedCategory) url.searchParams.append("category", selectedCategory)

        const response = await fetch(url.toString(), {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setVideos(data.videos)
        }
      } catch (err) {
        console.error("Failed to refetch videos:", err)
      }
    }
  }

  async function getAllVideos(token: string, selectedCategory: string | undefined): Promise<Video[]> {
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/videos`)
      if (selectedCategory) url.searchParams.append("category", selectedCategory)

      const response = await fetch(url.toString(), {
        credentials: "include",
      })
      if (!response.ok) throw new Error("Failed to fetch videos")
      const data = await response.json()
      return data.videos
    } catch (err) {
      console.error("Failed to fetch videos:", err)
      return []
    }
  }
  return (
    <div className="p-8 space-y-8">
      <VideoHeader onUploadClick={() => setUploadOpen(true)} />

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-destructive">{error}</div>
      ) : (
        <>
          <VideoList
            videos={videos}
            onVideoDeleted={() => {
              if (token) {
                getAllVideos(token, selectedCategory).then(setVideos)
              }
            }}
          />
        </>
      )}

      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} onVideoUploaded={handleVideoUploaded} />
    </div>
  )
}
