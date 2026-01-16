"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { AdminProvider, useAdmin } from "@/lib/admin-context"
import Sidebar from "@/components/admin/sidebar"

/**
 * This component MUST always return the same root JSX
 * on server and client to avoid hydration issues.
 */
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/login")
    }
  }, [loading, isAdmin, router])

  // ✅ Always render the same root element
  return (
    <div className="flex h-screen bg-background">
      {isAdmin && <Sidebar />}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  )
}
