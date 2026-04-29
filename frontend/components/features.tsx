"use client"

import { Monitor, Download, Smartphone, Tv, Shield, Zap } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: Monitor,
    title: "Watch Anywhere",
    description: "Stream on your laptop, TV, phone, or tablet. Your content follows you everywhere.",
  },
  {
    icon: Download,
    title: "Download & Watch",
    description: "Save your favorites and watch offline. Perfect for travel or limited connectivity.",
  },
  {
    icon: Smartphone,
    title: "Multi-Device",
    description: "Seamless switching between devices. Start on your phone, finish on your TV.",
  },
  {
    icon: Tv,
    title: "4K Ultra HD",
    description: "Crystal-clear picture quality with HDR support for a premium viewing experience.",
  },
  {
    icon: Shield,
    title: "Ad-Free",
    description: "No interruptions. Enjoy your shows and movies without a single advertisement.",
  },
  {
    icon: Zap,
    title: "Instant Streaming",
    description: "No buffering. Start watching instantly with our optimized streaming infrastructure.",
  },
]

export function Features() {
  return (
    <section className="relative py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Everything You Need to{" "}
            <span className="text-red-600">Stream</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Built for the best experience. Stream your favorite content with premium features included.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className="group glass-card rounded-2xl p-7 space-y-4 hover:border-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-600/15 flex items-center justify-center group-hover:bg-red-600/15 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
