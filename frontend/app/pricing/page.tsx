"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import axiosInstance from "@/lib/axios"

const PLANS = [
  { id: "monthly", name: "Monthly", price: "$9.99", billingCycle: "per month", features: ["HD streaming (1080p)", "Watch on 1 device", "Standard sound quality", "Ad-free experience", "Cancel anytime"] },
  { id: "half_yearly", name: "6-Month Plan", price: "$49.99", billingCycle: "for 6 months", popular: true, features: ["4K streaming", "Watch on 2 devices", "Premium sound quality", "Ad-free experience", "Cancel anytime", "Save 17% vs monthly"] },
  { id: "yearly", name: "Annual", price: "$89.99", billingCycle: "per year", features: ["4K streaming", "Watch on 4 devices", "Premium sound quality", "Ad-free experience", "Priority support", "Save 25% vs monthly"] },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSelectPlan = async (planId: string) => {
    setLoading(planId)
    try {
      const response = await axiosInstance.post("/payment/create-checkout-session", { planType: planId })
      if (response.data.url) {
        window.location.href = response.data.url
      }
    } catch (error: any) {
      console.error("Payment Error:", error)
      alert(error.response?.data?.message || "Failed to process payment")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 md:px-8 lg:px-12 space-y-12 pb-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Choose Your Plan</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Upgrade to Premium for 4K content and ad-free viewing.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`p-8 rounded-lg bg-secondary space-y-6 border ${plan.popular ? "ring-2 ring-primary border-primary" : "border-white/5"}`}>
              <div>
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.billingCycle}</span>
                </div>
              </div>
              <ul className="space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex gap-3"><Check className="w-5 h-5 text-primary" /><span>{f}</span></li>
                ))}
              </ul>
              <Button onClick={() => handleSelectPlan(plan.id)} disabled={loading !== null} className="w-full">
                {loading === plan.id ? "Processing..." : "Upgrade Now"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}