"use client"

import { useState } from "react"
import { useAdmin } from "@/lib/admin-context"
import { Button } from "@/components/ui/button"
import EditVideoModal from "./edit-video-modal"

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

interface VideoCardProps {
  video: Video
  onVideoDeleted: () => void
}

export default function VideoCard({ video, onVideoDeleted }: VideoCardProps) {
  const { token } = useAdmin()
  const [editOpen, setEditOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

 const handleDelete = async () => {
  if (!token || !confirm("Are you sure you want to delete this video?")) return

  try {
    setDeleting(true)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/videos/${video.id}`, {
      method: "DELETE",
      headers: {
        // ADD THESE HEADERS
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      credentials: "include",
    })
    
    if (!response.ok) {
      // Try to get the specific error message from the server
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || "Failed to delete video");
    }
    
    onVideoDeleted()
  } catch (error) {
    alert(error instanceof Error ? error.message : "Failed to delete video")
  } finally {
    setDeleting(false)
  }
}

  const statusColors = {
    PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    PROCESSING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
    FAILED: "bg-red-500/20 text-red-400 border-red-500/30",
  }

  return (
    <>
      <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
        <div className="relative">
          <img
            src={video.thumbnailUrl || "/placeholder.svg?height=200&width=300&query=video+thumbnail"}
            alt={video.title}
            className="w-full h-40 object-cover"
          />
          <div
            className={`absolute top-2 right-2 px-3 py-1 rounded text-xs font-semibold border ${statusColors[video.status]}`}
          >
            {video.status}
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h3 className="font-bold text-lg line-clamp-2">{video.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{video.description}</p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Views</p>
              <p className="font-bold text-primary">{video.views.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Category</p>
              <p className="font-medium">{video.category || "Uncategorized"}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="flex-1">
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting} className="flex-1">
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>

      <EditVideoModal video={video} open={editOpen} onOpenChange={setEditOpen} />
    </>
  )
}
