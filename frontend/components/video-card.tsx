"use client"

import Link from "next/link"
import Image from "next/image"
import { Play, Eye } from "lucide-react"
import { motion } from "framer-motion"

interface VideoCardProps {
  id: string
  title: string
  thumbnail: string | null
  views: number
  progress?: number // 0-100, for continue watching
}

export function VideoCard({ id, title, thumbnail, views, progress }: VideoCardProps) {
  return (
    <Link href={`/watch/${id}`} className="block">
      <motion.div
        whileHover={{ scale: 1.05, zIndex: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative group cursor-pointer overflow-hidden rounded-xl bg-card aspect-video flex-shrink-0"
      >
        {/* Thumbnail */}
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 280px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f]" />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-white/20 backdrop-blur-md rounded-full p-3 border border-white/20 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
        </div>

        {/* Bottom info — always visible */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <h3 className="text-white font-semibold text-sm line-clamp-1 mb-0.5">{title}</h3>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <Eye className="w-3 h-3" />
            <span>{views.toLocaleString()} views</span>
          </div>
        </div>

        {/* Progress bar for continue watching */}
        {progress !== undefined && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-800">
            <div
              className="progress-bar h-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}

        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[0_8px_40px_rgba(229,9,20,0.15)]" />
      </motion.div>
    </Link>
  )
}