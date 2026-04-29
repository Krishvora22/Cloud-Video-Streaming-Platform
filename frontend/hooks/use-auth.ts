"use client"

import { useState, useEffect } from "react"
import Cookies from "js-cookie"

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const token = Cookies.get("token") || localStorage.getItem("token")
      setIsLoggedIn(!!token)
    } catch (e) {
      console.error("Storage access error:", e)
      setIsLoggedIn(!!Cookies.get("token"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { isLoggedIn, isLoading }
}
