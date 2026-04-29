"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { VideoCard } from "@/components/video-card"
import { PageTransition } from "@/components/page-transition"
import { Loader2, SearchX } from "lucide-react"
import { motion } from "framer-motion"
import axiosInstance from "@/lib/axios"

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setResults([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const res = await axiosInstance.get(`/videos/search?query=${encodeURIComponent(query)}`)
        if (res.data.success) {
          setResults(res.data.videos)
        } else {
          setResults([])
        }
      } catch (error) {
        console.error("Search Page Error:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchSearchResults()
  }, [query])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-red-600/20 rounded-full blur-xl animate-pulse" />
          <Loader2 className="w-12 h-12 animate-spin text-red-500 relative" />
        </div>
        <h2 className="text-xl font-medium text-white">Searching StreamFlix...</h2>
        <p className="text-gray-500 italic">Looking for &quot;{query}&quot;</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-white/[0.06] pb-4"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {results.length > 0 ? (
            <>
              Found {results.length} results for <span className="text-red-500">&quot;{query}&quot;</span>
            </>
          ) : (
            <>Search results for <span className="text-red-500">&quot;{query}&quot;</span></>
          )}
        </h1>
      </motion.div>

      {/* Results grid */}
      {results.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05 },
            },
          }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-8"
        >
          {results.map((video: any) => (
            <motion.div
              key={video.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <VideoCard
                id={video.id}
                title={video.title}
                thumbnail={video.thumbnailUrl}
                views={video.views}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-28 text-center"
        >
          <div className="w-24 h-24 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
            <SearchX className="w-12 h-12 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">No results found</h2>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
            We couldn&apos;t find any movies or shows matching &quot;{query}&quot;.
            Try checking for typos or searching for a broader term.
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageTransition>
        <main className="pt-24 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-red-500" />
              </div>
            }
          >
            <SearchResults />
          </Suspense>
        </main>
      </PageTransition>
    </div>
  )
}