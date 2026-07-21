import React from 'react'

import type { GalleryBlock as GalleryBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'
import { Reveal } from '@/components/Motion/Reveal'
import { cn } from '@/utilities/ui'

export const GalleryBlock: React.FC<GalleryBlockProps> = ({ columns = '3', heading, items }) => {
  return (
    <section className="py-14 md:py-20">
      <div className="container">
        {heading && (
          <Reveal>
            <h2 className="text-h2 mb-8">{heading}</h2>
          </Reveal>
        )}
        <ul
          className={cn(
            'grid gap-4 md:gap-6 list-none p-0',
            columns === '2' && 'grid-cols-1 sm:grid-cols-2',
            columns === '3' && 'grid-cols-2 lg:grid-cols-3',
            columns === '4' && 'grid-cols-2 lg:grid-cols-4',
          )}
        >
          {(items || []).map((item, index) => (
            <Reveal as="li" delay={(index % 4) * 0.05} key={item.id ?? index}>
              <figure className="overflow-hidden rounded-xl bg-secondary">
                {item.image && typeof item.image === 'object' && (
                  <Media
                    imgClassName="w-full h-auto aspect-4/3 object-cover transition-transform duration-300 hover:scale-[1.03]"
                    resource={item.image}
                    size="(max-width: 768px) 50vw, 33vw"
                  />
                )}
                {item.caption && (
                  <figcaption className="px-3 py-2 text-sm text-muted-foreground">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
