"use client"

import { useState } from "react"
import { useAdmin } from "@/lib/admin-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

interface EditVideoModalProps {
  video: Video
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditVideoModal({ video, open, onOpenChange }: EditVideoModalProps) {
  const { token } = useAdmin()
  const [title, setTitle] = useState(video.title)
  const [description, setDescription] = useState(video.description || "")
  const [category, setCategory] = useState(video.category || "Action")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!token) return

    try {
      setSaving(true)
      setError(null)
        const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/videos/${video.id}`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 🔥 REQUIRED
    },
    credentials: "include",
    body: JSON.stringify({
      title,
      description,
      category,
      thumbnailUrl: video.thumbnailUrl,
    }),
  }
);

      if (!response.ok) throw new Error("Failed to update video")
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update video")
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Edit Video</h2>
          <p className="text-muted-foreground">{video.title}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-input bg-input px-3 py-2 text-foreground resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-input bg-input px-3 py-2 text-foreground"
            >
              <option>Action</option>
              <option>Comedy</option>
              <option>Drama</option>
              <option>Horror</option>
              <option>Sci-Fi</option>
              <option>Documentary</option>
            </select>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive rounded p-3 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !title} className="flex-1 bg-primary hover:bg-primary/90">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
