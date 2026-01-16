import StatCard from "./stat-card"

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

interface StatsGridProps {
  stats: DashboardStats
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon="👥" color="primary" />
      <StatCard title="Total Videos" value={stats.totalVideos.toLocaleString()} icon="🎬" color="accent" />
      <StatCard title="Total Views" value={stats.totalViews.toLocaleString()} icon="👁️" color="primary" />
      <StatCard
        title="Engagement"
        value={stats.totalViews > 0 ? Math.round((stats.totalViews / Math.max(stats.totalUsers, 1)) * 10) / 10 : 0}
        icon="📊"
        color="accent"
        suffix="/user"
      />
    </div>
  )
}
