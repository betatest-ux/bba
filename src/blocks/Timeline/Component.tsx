import React from 'react'

import type { TimelineBlock as TimelineBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'
import { Reveal } from '@/components/Motion/Reveal'
import RichText from '@/components/RichText'

export const TimelineBlock: React.FC<TimelineBlockProps> = ({ heading, items }) => {
  return (
    <section className="py-14 md:py-20">
      <div className="container max-w-3xl">
        {heading && (
          <Reveal>
            <h2 className="text-h2 mb-10">{heading}</h2>
          </Reveal>
        )}
        <ol className="relative ms-3 border-s-2 border-brand/30 list-none p-0">
          {(items || []).map((item, index) => (
            <Reveal as="li" className="relative mb-10 ps-8 last:mb-0" delay={index * 0.05} key={item.id ?? index}>
              <span
                aria-hidden
                className="absolute -start-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-background bg-brand"
              />
              <p className="font-display text-sm font-bold uppercase tracking-wider text-brand">
                {item.marker}
              </p>
              <h3 className="mt-1 text-h3">{item.title}</h3>
              {item.description && (
                <div className="mt-2 text-muted-foreground">
                  <RichText data={item.description} enableGutter={false} />
                </div>
              )}
              {item.image && typeof item.image === 'object' && (
                <div className="mt-4 max-w-sm overflow-hidden rounded-xl">
                  <Media imgClassName="w-full h-auto" resource={item.image} size="384px" />
                </div>
              )}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
