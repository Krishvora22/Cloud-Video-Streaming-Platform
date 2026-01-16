"use client"

import { useRouter } from "next/navigation"
import { useAdmin } from "@/lib/admin-context"
import Link from "next/link"

export default function Sidebar() {
  const router = useRouter()
  const { logout } = useAdmin()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Videos", href: "/admin/videos", icon: "🎬" },
  ]

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-sidebar-primary">StreamHub</h1>
        <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/20 transition-colors"
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="w-full px-4 py-3 rounded-lg bg-sidebar-accent/20 text-sidebar-foreground hover:bg-sidebar-accent/30 transition-colors font-medium"
      >
        Logout
      </button>
    </div>
  )
}
