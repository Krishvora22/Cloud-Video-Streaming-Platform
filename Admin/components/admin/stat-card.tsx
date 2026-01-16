interface StatCardProps {
  title: string
  value: string | number
  icon: string
  color: "primary" | "accent"
  suffix?: string
}

export default function StatCard({ title, value, icon, color, suffix }: StatCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 border-primary/20",
    accent: "bg-accent/10 border-accent/20",
  }

  return (
    <div className={`rounded-lg border ${colorClasses[color]} p-6 space-y-2`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold">{value}</p>
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  )
}
