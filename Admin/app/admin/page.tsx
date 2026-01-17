"use client"

import { useEffect, useState } from "react"
import { useAdmin } from "@/lib/admin-context"
import DashboardHeader from "@/components/admin/dashboard-header"
import StatsGrid from "@/components/admin/stats-grid"
import MostWatchedCard from "@/components/admin/most-watched-card"

interface DashboardStats {
  totalUsers: number
  totalVideos: number
  totalViews: number
  mostWatched: {
    title: string
    views: number
    thumbnailUrl: string
    uploader: { email: string }
  } | null
}

export default function AdminDashboard() {
  const { token } = useAdmin()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    async function fetchStats() {
  try {
    setLoading(true);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
      method: "GET", // Specify method
      headers: {
        "Content-Type": "application/json",
        // ADD THIS LINE:
        "Authorization": `Bearer ${token}` 
      },
      // Keep this if you are using cookies AS WELL as tokens
      credentials: "include", 
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch stats");
    }
    
    const data = await response.json();
    setStats(data.stats);
    setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to fetch stats");
  } finally {
    setLoading(false);
  }
}

    fetchStats()
  }, [token])

  return (
    <div className="p-8 space-y-8">
      <DashboardHeader />

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-destructive">{error}</div>
      ) : stats ? (
        <>
          <StatsGrid stats={stats} />
          {stats.mostWatched && <MostWatchedCard video={stats.mostWatched} />}
        </>
      ) : null}
    </div>
  )
}
