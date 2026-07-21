'use client'

import { Play } from 'lucide-react'
import React, { useState } from 'react'

import type { VideoEmbedBlock as VideoEmbedBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'

const embedURL = (url: string): string | null => {
  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/)
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}?autoplay=1`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&dnt=1`
  return null
}

/**
 * Cookie-respecting video: nothing is loaded from YouTube/Vimeo until the
 * visitor explicitly presses play (and then via the no-cookie/do-not-track
 * player domains).
 */
export const VideoEmbedBlock: React.FC<VideoEmbedBlockProps> = ({ caption, poster, title, url }) => {
  const [loaded, setLoaded] = useState(false)
  const src = embedURL(url)

  return (
    <section className="py-14 md:py-20">
      <div className="container max-w-4xl">
        <figure>
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-loom">
            {loaded && src ? (
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
                referrerPolicy="strict-origin-when-cross-origin"
                src={src}
                title={title}
              />
            ) : (
              <button
                aria-label={`Play video: ${title}`}
                className="group absolute inset-0 flex w-full items-center justify-center"
                onClick={() => setLoaded(true)}
                type="button"
              >
                {poster && typeof poster === 'object' && (
                  <Media
                    fill
                    imgClassName="object-cover opacity-70"
                    resource={poster}
                    size="(max-width: 1024px) 100vw, 896px"
                  />
                )}
                <span className="relative z-10 flex flex-col items-center gap-3 text-white">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-brand-on transition-transform duration-200 group-hover:scale-110">
                    <Play aria-hidden className="ml-1" size={26} />
                  </span>
                  <span className="text-sm font-medium">
                    Play video — loads from {url.includes('vimeo') ? 'Vimeo' : 'YouTube'}
                  </span>
                </span>
              </button>
            )}
          </div>
          {caption && (
            <figcaption className="mt-3 text-sm text-muted-foreground">{caption}</figcaption>
          )}
        </figure>
      </div>
    </section>
  )
}
