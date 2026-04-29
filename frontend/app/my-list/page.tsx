"use client"

import { Navbar } from "@/components/navbar"
import { VideoRow } from "@/components/video-row"
import { PageTransition } from "@/components/page-transition"
import { motion } from "framer-motion"
import { Bookmark } from "lucide-react"

export default function MyListPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageTransition>
        <div className="pt-24 px-4 md:px-8 lg:px-12 pb-16 max-w-[1600px] mx-auto space-y-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="border-b border-white/[0.06] pb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-red-500" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">My List</h1>
            </div>
            <p className="text-gray-500 ml-[52px]">
              Your personal collection of movies and shows to watch later.
            </p>
          </motion.div>

          {/* Watchlist */}
          <VideoRow title="Your Watchlist" endpoint="/watchlist" />
        </div>
      </PageTransition>
    </div>
  )
}