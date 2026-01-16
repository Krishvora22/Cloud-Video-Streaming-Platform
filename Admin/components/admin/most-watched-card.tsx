interface Video {
  title: string
  views: number
  thumbnailUrl: string
  uploader: { email: string }
}

interface MostWatchedCardProps {
  video: Video
}

export default function MostWatchedCard({ video }: MostWatchedCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div className="md:col-span-1">
          <img
            src={video.thumbnailUrl || "/placeholder.svg?height=200&width=300&query=video+thumbnail"}
            alt={video.title}
            className="w-full h-auto rounded-lg object-cover aspect-video"
          />
        </div>
        <div className="md:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">Most Watched Video</h3>
            <h2 className="text-2xl font-bold text-balance">{video.title}</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Views</span>
              <span className="text-2xl font-bold text-primary">{video.views.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Uploaded by</span>
              <span className="font-mono text-sm">{video.uploader.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
