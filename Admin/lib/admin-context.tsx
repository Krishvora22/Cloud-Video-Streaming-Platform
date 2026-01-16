"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"

interface User {
  id: string
  email: string
  role: string
}

interface AdminContextType {
  token: string | null
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  setToken: (token: string | null, user?: User | null) => void
  logout: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // ✅ Client-only initialization (hydration safe)
  useEffect(() => {
    const storedToken = localStorage.getItem("admin_token")
    const storedUser = localStorage.getItem("admin_user")

    if (storedToken) {
      setTokenState(storedToken)
    }

    if (storedUser) {
      try {
        setUserState(JSON.parse(storedUser))
      } catch {
        setUserState(null)
      }
    }

    setLoading(false)
  }, [])

  const setToken = useCallback(
    (newToken: string | null, newUser?: User | null) => {
      setTokenState(newToken)
      setUserState(newUser ?? null)

      if (newToken) {
        localStorage.setItem("admin_token", newToken)
        if (newUser) {
          localStorage.setItem("admin_user", JSON.stringify(newUser))
        }
      } else {
        localStorage.removeItem("admin_token")
        localStorage.removeItem("admin_user")
      }
    },
    []
  )

  const logout = useCallback(() => {
    setToken(null)
  }, [setToken])

  return (
    <AdminContext.Provider
      value={{
        token,
        user,
        loading,
        setToken,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === "ADMIN",
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider")
  }
  return context
}
