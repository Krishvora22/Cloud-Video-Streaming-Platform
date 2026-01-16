"use client"

import type React from "react"

import { AdminProvider } from "@/lib/admin-context"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AdminProvider>{children}</AdminProvider>
}
