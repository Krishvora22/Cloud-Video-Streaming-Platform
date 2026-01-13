import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground">StreamFlix</h1>
        <p className="text-xl md:text-2xl text-muted-foreground">Watch unlimited movies and TV shows</p>
        <p className="text-base md:text-lg text-muted-foreground max-w-xl">
          Stream your favorite content anywhere, anytime. Enjoy premium video quality and original productions.
        </p>
        <div className="flex gap-4 justify-center pt-8">
          <Link href="/login">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline" className="px-8 bg-transparent">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
