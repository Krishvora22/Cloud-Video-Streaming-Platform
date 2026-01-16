"use client"

import VideoCard from "./video-card"

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

interface VideoListProps {
  videos: Video[]
  onVideoDeleted: () => void
}

export default function VideoList({ videos, onVideoDeleted }: VideoListProps) {
  if (videos.length === 0) {
    return (
      <div className="border border-border rounded-lg p-12 text-center">
        <p className="text-muted-foreground text-lg">No videos found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} onVideoDeleted={onVideoDeleted} />
      ))}
    </div>
  )
}
