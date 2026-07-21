import React from 'react'

import type { ImageTextSplitBlock as ImageTextSplitBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { Reveal } from '@/components/Motion/Reveal'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

export const ImageTextSplitBlock: React.FC<ImageTextSplitBlockProps> = ({
  background,
  enableLink,
  image,
  imagePosition,
  link,
  richText,
}) => {
  return (
    <section className={cn('py-14 md:py-20', background === 'tint' && 'bg-secondary')}>
      <div className="container">
        <div
          className={cn(
            'grid items-center gap-10 lg:gap-16 lg:grid-cols-2',
            imagePosition === 'right' && 'lg:[&>*:first-child]:order-2',
          )}
        >
          <Reveal>
            <div className="overflow-hidden rounded-2xl">
              {image && typeof image === 'object' && (
                <Media
                  imgClassName="w-full h-auto object-cover aspect-4/3"
                  resource={image}
                  size="(max-width: 1024px) 100vw, 50vw"
                />
              )}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div>
              {richText && <RichText data={richText} enableGutter={false} />}
              {enableLink && link && (
                <div className="mt-6">
                  <CMSLink {...link} />
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
