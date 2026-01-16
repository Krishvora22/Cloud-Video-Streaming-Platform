"use client"

import type React from "react"

import { useState } from "react"
import { useAdmin } from "@/lib/admin-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface UploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVideoUploaded: () => void
}

export default function UploadModal({ open, onOpenChange, onVideoUploaded }: UploadModalProps) {
  const { token } = useAdmin()
  const [step, setStep] = useState<"details" | "upload">("details")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Action")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [videoId, setVideoId] = useState("")

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && f.type.startsWith("video/")) {
      setFile(f)
      setError(null)
    } else {
      setError("Please select a valid video file")
      setFile(null)
    }
  }

  const handleUpload = async () => {
    if (!token || !file || !title) return

    try {
      setUploading(true)
      setError(null)

      // Step 1: Get upload URL
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/admin/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title }),
      })
      if (!uploadResponse.ok) throw new Error("Failed to get upload URL")
      const { uploadUrl, videoId: id } = await uploadResponse.json()
      setVideoId(id)
      setProgress(25)

      // Step 2: Upload to S3
      const s3Response = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })
      if (!s3Response.ok) throw new Error("Failed to upload video")
      setProgress(75)

      // Step 3: Create metadata
      const metadataResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/admin/videos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          videoId: id,
          title,
          description,
          thumbnailUrl: `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(title)}`,
        }),
      })
      if (!metadataResponse.ok) throw new Error("Failed to create video metadata")
      setProgress(100)

      // Reset and close
      setTimeout(() => {
        onVideoUploaded()
        resetForm()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setStep("details")
    setTitle("")
    setDescription("")
    setCategory("Action")
    setFile(null)
    setProgress(0)
    setError(null)
    setVideoId("")
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Upload Video</h2>
          <p className="text-muted-foreground">Step {step === "details" ? 1 : 2} of 2</p>
        </div>

        {step === "details" ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Title *</label>
              <Input placeholder="Video title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Description</label>
              <textarea
                placeholder="Video description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-input bg-input px-3 py-2 text-foreground placeholder-muted-foreground resize-none"
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

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => setStep("upload")}
                disabled={!title}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input type="file" accept="video/*" onChange={handleSelectFile} className="hidden" id="video-input" />
              <label htmlFor="video-input" className="cursor-pointer block">
                <div className="text-4xl mb-2">🎬</div>
                {file ? (
                  <div>
                    <p className="font-semibold">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <p className="font-semibold">Click to select video</p>
                    <p className="text-sm text-muted-foreground">or drag and drop</p>
                  </>
                )}
              </label>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive rounded p-3 text-destructive text-sm">
                {error}
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep("details")} disabled={uploading} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
