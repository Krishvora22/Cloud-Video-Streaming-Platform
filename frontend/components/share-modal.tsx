'use client'

import { useState } from 'react'
import { Share2, Copy, Check, MessageCircle, Twitter } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ShareModalProps {
  videoId: string
}

export function ShareModal({ videoId }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `https://streamflix.krisvora.me/watch/${videoId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Video</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={shareUrl}
              readOnly
              className="flex-1"
            />
            <Button onClick={copyToClipboard} size="sm">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          {/* Optional: Add social share buttons */}
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = `https://wa.me/?text=${encodeURIComponent(`Check out this video: ${shareUrl}`)}`
                window.open(url, '_blank')
              }}
              className="gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this video: ${shareUrl}`)}`
                window.open(url, '_blank')
              }}
              className="gap-2"
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}