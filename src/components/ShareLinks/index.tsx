'use client'

import { Facebook, Link2, MessageCircle, Share2, Twitter } from 'lucide-react'
import React, { useState } from 'react'

/**
 * Share row with zero third-party scripts — plain intent URLs, the native
 * share sheet where available, and copy-to-clipboard with a polite
 * confirmation for assistive tech.
 */
export const ShareLinks: React.FC<{ title: string; url: string }> = ({ title, url }) => {
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)

  React.useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && Boolean(navigator.share))
  }, [])

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const iconButton =
    'flex h-11 w-11 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary'

  return (
    <div aria-label="Share this article" className="flex items-center gap-3" role="group">
      <span className="me-1 text-sm font-medium text-muted-foreground">Share</span>

      <button
        aria-label="Copy link"
        className={iconButton}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          } catch {
            /* clipboard unavailable */
          }
        }}
        type="button"
      >
        <Link2 aria-hidden size={18} />
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? 'Link copied to clipboard' : ''}
      </span>
      {copied && <span className="text-sm font-medium text-success">Copied!</span>}

      {canNativeShare && (
        <button
          aria-label="Share via your device"
          className={iconButton}
          onClick={() => navigator.share({ title, url }).catch(() => undefined)}
          type="button"
        >
          <Share2 aria-hidden size={18} />
        </button>
      )}

      <a
        aria-label="Share on X (Twitter)"
        className={iconButton}
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Twitter aria-hidden size={18} />
      </a>
      <a
        aria-label="Share on Facebook"
        className={iconButton}
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Facebook aria-hidden size={18} />
      </a>
      <a
        aria-label="Share on WhatsApp"
        className={iconButton}
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <MessageCircle aria-hidden size={18} />
      </a>
    </div>
  )
}
