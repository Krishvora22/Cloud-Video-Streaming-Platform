"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX, Maximize, Play, Pause, AlertCircle } from "lucide-react" // Added AlertCircle

interface HLSPlayerProps {
  src: string
  onProgress?: (progress: number, duration: number) => void
  autoPlay?: boolean
  poster?: string
  initialTime?: number
}

export function HLSPlayer({
  src,
  onProgress,
  autoPlay = false,
  poster,
  initialTime = 0,
}: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [hasError, setHasError] = useState(false) // FIX: Error state

  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const hasResumedRef = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.src = src
    hasResumedRef.current = false
    setHasError(false) // Reset error when src changes

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      if (initialTime > 0 && !hasResumedRef.current) {
        video.currentTime = initialTime
        hasResumedRef.current = true
      }
    }

    const handleTimeUpdate = () => {
      if (!video.duration) return
      const percent = (video.currentTime / video.duration) * 100
      setProgress(percent)
      onProgress?.(video.currentTime, video.duration)
    }

    // FIX: Error handler
    const handleError = () => {
      setHasError(true)
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("play", () => setIsPlaying(true))
    video.addEventListener("pause", () => setIsPlaying(false))
    video.addEventListener("error", handleError) // Listen for playback errors

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("error", handleError)
    }
  }, [src, initialTime])

  /* ================= AUTO HIDE CONTROLS ================= */
  useEffect(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    setShowControls(true)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
    return () => clearTimeout(controlsTimeoutRef.current)
  }, [isPlaying])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video || hasError) return
    isPlaying ? video.pause() : video.play()
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video || !duration) return
    video.currentTime = (Number(e.target.value) / 100) * duration
  }

  const handleFullscreen = () => {
    videoRef.current?.requestFullscreen()
  }

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00"
    const m = Math.floor(time / 60)
    const s = Math.floor(time % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div
      className="relative w-full h-full aspect-video bg-black overflow-hidden group"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* FIX: Error Boundary UI */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 text-center px-6">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-xl font-bold text-white">Video Unavailable</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            We're having trouble loading this video. Please check your connection or try again later.
          </p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            poster={poster}
            autoPlay={autoPlay}
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-contain bg-black"
          />

          <div
            className={`absolute bottom-0 left-0 right-0 px-4 pb-4 pt-10 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 mb-4 cursor-pointer accent-primary"
            />

            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay}>
                  {isPlaying ? <Pause /> : <Play className="fill-white" />}
                </button>
                <button onClick={toggleMute}>
                  {isMuted ? <VolumeX /> : <Volume2 />}
                </button>
                <span className="text-sm font-mono">
                  {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
                </span>
              </div>
              <button onClick={handleFullscreen}>
                <Maximize />
              </button>
            </div>
          </div>

          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition"
            >
              <div className="bg-primary rounded-full p-6">
                <Play className="w-12 h-12 text-white fill-white" />
              </div>
            </button>
          )}
        </>
      )}
    </div>
  )
}