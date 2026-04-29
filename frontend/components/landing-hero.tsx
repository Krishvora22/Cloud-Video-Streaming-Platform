import { useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, ChevronRight, Sparkles } from "lucide-react"
import { motion, Variants } from "framer-motion"

export function LandingHero() {
  const bgRef = useRef<HTMLDivElement | null>(null)
  const mousePosRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = {
        x: (e.clientX - window.innerWidth / 2) * 0.03,
        y: (e.clientY - window.innerHeight / 2) * 0.03,
      }

      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null
          if (bgRef.current) {
            bgRef.current.style.transform = `translate3d(${mousePosRef.current.x}px, ${mousePosRef.current.y}px, 0)`
          }
        })
      }
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  }

  const titleWords = ["Unlimited", "Movies,", "TV", "Shows", "&", "More"]

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden bg-[#050505]">
      {/* Dynamic Parallax Background / Ambient Glows */}
      <div
        ref={bgRef}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-0 left-1/4 w-[60vw] h-[60vh] bg-purple-900/10 rounded-full blur-[140px] animate-pulse mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vh] bg-blue-900/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vh] bg-red-900/5 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      {/* Grid Pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-5xl relative z-30 space-y-8 mt-16"
      >
        {/* Subtle Badge */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <div className="group relative inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-red-600/50 via-purple-500/50 to-blue-600/50">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-gray-300 text-xs font-semibold tracking-wide uppercase group-hover:text-white transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Next-Gen Streaming Experience
            </span>
          </div>
        </motion.div>

        {/* Main Title with Continuous Glowing Text Gradient */}
        <motion.div variants={itemVariants} className="flex justify-center px-2">
          <h1
            className="text-5xl sm:text-7xl md:text-8xl lg:text-[6rem] font-black tracking-tight leading-[1.1] text-transparent bg-clip-text animate-text-pan drop-shadow-[0_0_30px_rgba(236,72,153,0.3)] pb-2"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ff2a2a, #ff6bdf, #c026d3, #3b82f6, #8b5cf6, #ff2a2a)",
              backgroundSize: "200% auto",
            }}
          >
            Unlimited Movies,
            <br className="hidden sm:block" />
            <span className="inline-block mt-2">TV Shows &amp; More</span>
          </h1>
        </motion.div>

        {/* Cinematic Subtitle */}
        <motion.div variants={itemVariants} className="space-y-4">
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-medium tracking-wide">
            Watch anywhere. Cancel anytime.
          </p>
          <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto">
            Experience cinematic brilliance across all your devices. Unlimited access to exclusive blockbusters and award-winning originals.
          </p>
        </motion.div>

        {/* Premium CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-5 justify-center pt-6"
        >
          <Link href="/signup">
            <div className="relative group">
              {/* Outer glowing border for Primary Button */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-purple-600 rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200" />
              <Button
                size="lg"
                className="relative bg-red-600 hover:bg-red-700 text-white px-10 py-7 text-lg font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-2xl gap-3 w-full sm:w-auto overflow-hidden group/btn"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover/btn:animate-[shimmer_2s_infinite]" />
                <Play className="w-5 h-5 fill-current" />
                Get Started
              </Button>
            </div>
          </Link>
          
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="bg-white/5 hover:bg-white/10 border-white/15 text-white px-10 py-7 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-95 backdrop-blur-md gap-2 w-full sm:w-auto"
            >
              Sign In
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

      </motion.div>

      {/* Fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/60 to-transparent pointer-events-none z-20" />
    </section>
  )
}
