'use client'

import { X } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import type { AnnouncementBar } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

type Props = {
  dismissKey: string
  link: AnnouncementBar['link'] | null
  message: NonNullable<AnnouncementBar['message']>
  variant: 'info' | 'urgent'
}

export const AnnouncementBarClient: React.FC<Props> = ({ dismissKey, link, message, variant }) => {
  // Render nothing until mounted so dismissal state can't cause hydration
  // mismatches; the bar then slides in unless previously dismissed.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(dismissKey) !== 'dismissed')
    } catch {
      setVisible(true)
    }
  }, [dismissKey])

  if (!visible) return null

  return (
    <div
      className={cn(
        'relative border-b',
        variant === 'urgent'
          ? 'border-brick/40 bg-brick text-white'
          : 'border-loom/40 bg-loom text-white',
      )}
      role="region"
      aria-label="Announcement"
    >
      <div className="container flex min-h-11 flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2 pe-12 text-center text-sm">
        <div className="[&_a]:underline [&_p]:m-0">
          <RichText data={message} enableGutter={false} enableProse={false} />
        </div>
        {link && (
          <CMSLink
            className="shrink-0 rounded-full bg-white/15 px-4 py-1.5 font-semibold transition-colors hover:bg-white/25"
            {...link}
            appearance="inline"
          />
        )}
      </div>
      <button
        aria-label="Dismiss announcement"
        className="absolute end-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-white/15"
        onClick={() => {
          setVisible(false)
          try {
            localStorage.setItem(dismissKey, 'dismissed')
          } catch {
            /* private browsing — fine */
          }
        }}
        type="button"
      >
        <X aria-hidden size={16} />
      </button>
    </div>
  )
}
