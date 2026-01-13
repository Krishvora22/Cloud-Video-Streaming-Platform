"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button" // Fixed import

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session_id")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

useEffect(() => {
  if (sessionId) {
    axiosInstance.post("/payment/verify-session", { sessionId })
      .then(() => {
        setStatus("success");
        // Keep the timer inside the .then so it only runs once!
        setTimeout(() => {
          router.push("/home");
        }, 3000);
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  }
}, [sessionId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      {status === "loading" && (
        <div className="space-y-4 text-white">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Verifying Payment...</h1>
        </div>
      )}
      {status === "success" && (
        <div className="space-y-4 text-white">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold">Success!</h1>
          <p>Your account is now Premium. Redirecting home...</p>
        </div>
      )}
      {status === "error" && (
        <div className="space-y-4 text-white">
          <XCircle className="w-12 h-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Verification Failed</h1>
          <Button onClick={() => router.push("/pricing")}>Try Again</Button>
        </div>
      )}
    </div>
  )
}