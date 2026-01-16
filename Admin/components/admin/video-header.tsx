"use client"

import { Button } from "@/components/ui/button"

interface VideoHeaderProps {
  onUploadClick: () => void
}

export default function VideoHeader({ onUploadClick }: VideoHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Videos</h1>
        <p className="text-muted-foreground">Manage your video library</p>
      </div>
      <Button onClick={onUploadClick} size="lg" className="bg-primary hover:bg-primary/90">
        + Upload Video
      </Button>
    </div>
  )
}
