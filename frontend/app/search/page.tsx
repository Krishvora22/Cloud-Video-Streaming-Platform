"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { VideoCard } from "@/components/video-card"
import { Loader2, SearchX } from "lucide-react"
import axiosInstance from "@/lib/axios"

// Separate component to handle the search logic within Suspense
function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSearchResults = async () => {
      // If no query exists, stop loading and show empty results
      if (!query.trim()) {
        setResults([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Fetch results from your backend search endpoint
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
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <h2 className="text-xl font-medium text-foreground">Searching StreamFlix...</h2>
        <p className="text-muted-foreground italic">Looking for "{query}"</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header section showing the query results count */}
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold text-foreground">
          {results.length > 0 ? (
            <>
              Found {results.length} results for <span className="text-primary">"{query}"</span>
            </>
          ) : (
            <>Search results for <span className="text-primary">"{query}"</span></>
          )}
        </h1>
      </div>

      {/* Grid display for video results */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10">
          {results.map((video: any) => (
            <VideoCard
              key={video.id}
              id={video.id}
              title={video.title}
              thumbnail={video.thumbnailUrl}
              views={video.views}
            />
          ))}
        </div>
      ) : (
        // Enhanced Empty State UI
        <div className="flex flex-col items-center justify-center py-32 text-center bg-secondary/10 rounded-3xl border border-dashed border-white/10">
          <div className="bg-secondary p-6 rounded-full mb-6">
            <SearchX className="w-16 h-16 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">No results found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We couldn't find any movies or shows matching "{query}". 
            Try checking for typos or searching for a broader term like "Action" or "Marvel".
          </p>
        </div>
      )}
    </div>
  )
}

// Main Page Component
export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Main content area with top padding for fixed Navbar */}
      <main className="pt-28 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto">
        {/* Suspense is mandatory when using useSearchParams in Next.js App Router */}
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        }>
          <SearchResults />
        </Suspense>
      </main>
    </div>
  )
}