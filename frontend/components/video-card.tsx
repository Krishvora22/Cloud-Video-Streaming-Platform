"use client"

import Link from "next/link"
import { useState } from "react"
import { Play } from "lucide-react"

interface VideoCardProps {
  id: string
  title: string
  thumbnail: string | null
  views: number
}

export function VideoCard({ id, title, thumbnail, views }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link href={`/watch/${id}`}>
      <div
        className="relative group cursor-pointer overflow-hidden rounded-lg bg-secondary aspect-video transition-transform duration-300 flex-shrink-0"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          // FIX: Added background color fallback for consistency
          backgroundColor: "#1f1f1f",
          backgroundImage: thumbnail ? `url(${thumbnail})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-primary/90 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          <h3 className="text-foreground font-semibold text-sm line-clamp-2">{title}</h3>
          <p className="text-muted-foreground text-xs mt-1">{views.toLocaleString()} views</p>
        </div>
      </div>
    </Link>
  )
}