"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Zap, Crown } from "lucide-react"
import { motion } from "framer-motion"
import { PageTransition } from "@/components/page-transition"
import axiosInstance from "@/lib/axios"

const PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    price: "$9.99",
    billingCycle: "per month",
    icon: Zap,
    features: [
      "HD streaming (1080p)",
      "Watch on 1 device",
      "Standard sound quality",
      "Ad-free experience",
      "Cancel anytime",
    ],
  },
  {
    id: "half_yearly",
    name: "6-Month Plan",
    price: "$49.99",
    billingCycle: "for 6 months",
    popular: true,
    icon: Sparkles,
    features: [
      "4K streaming",
      "Watch on 2 devices",
      "Premium sound quality",
      "Ad-free experience",
      "Cancel anytime",
      "Save 17% vs monthly",
    ],
  },
  {
    id: "yearly",
    name: "Annual",
    price: "$89.99",
    billingCycle: "per year",
    icon: Crown,
    features: [
      "4K streaming",
      "Watch on 4 devices",
      "Premium sound quality",
      "Ad-free experience",
      "Priority support",
      "Save 25% vs monthly",
    ],
  },
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

      <PageTransition>
        <div className="pt-24 px-4 md:px-8 lg:px-12 pb-16 max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-white"
            >
              Choose Your Plan
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-gray-400 max-w-2xl mx-auto text-lg"
            >
              Upgrade to Premium for 4K content, multiple devices, and an ad-free experience.
            </motion.p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, index) => {
              const Icon = plan.icon
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 * index }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className={`relative glass-card rounded-2xl p-8 space-y-8 transition-all duration-300 ${
                    plan.popular
                      ? "ring-2 ring-red-600/50 shadow-[0_0_40px_rgba(229,9,20,0.15)]"
                      : "hover:border-white/10"
                  }`}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-red-600/30">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${plan.popular ? "text-red-500" : "text-gray-400"}`} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-500 text-sm">/{plan.billingCycle}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? "text-red-500" : "text-green-500"}`} />
                        <span className="text-gray-300 text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loading !== null}
                    className={`w-full py-6 rounded-xl font-bold text-base transition-all duration-300 ${
                      plan.popular
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 hover:shadow-red-600/30"
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    }`}
                  >
                    {loading === plan.id ? "Processing..." : "Upgrade Now"}
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </div>
      </PageTransition>
    </div>
  )
}