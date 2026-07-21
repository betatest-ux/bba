import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import type { Appeal, AppealProgressBlock as AppealProgressBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'
import { Reveal } from '@/components/Motion/Reveal'
import { Thermometer } from './Thermometer'
import RichText from '@/components/RichText'
import { getCachedGlobal } from '@/utilities/getGlobals'

export const AppealProgressBlock: React.FC<AppealProgressBlockProps> = async ({
  appeal: appealProp,
  compact,
  showStory,
}) => {
  let appeal: Appeal | null = null

  if (typeof appealProp === 'object' && appealProp !== null) {
    appeal = appealProp
  } else if (appealProp) {
    const payload = await getPayload({ config: configPromise })
    appeal = await payload
      .findByID({ collection: 'appeals', id: appealProp, overrideAccess: false })
      .catch(() => null)
  }

  if (!appeal) return null

  const donationSettings = await getCachedGlobal('donation-settings', 0)().catch(() => null)
  const donateUrl = appeal.donateUrl || donationSettings?.donateUrl || '/donate'
  const donateLabel = donationSettings?.donateLabel || 'Donate'

  return (
    <section className="py-14 md:py-20 bg-secondary">
      <div className="container">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-wider text-brand">
                Current appeal
              </p>
              <h2 className="mt-2 text-h2">
                <Link className="hover:underline" href={`/appeals/${appeal.slug}`}>
                  {appeal.title}
                </Link>
              </h2>
              {!compact && appeal.summary && (
                <p className="mt-4 text-lg text-muted-foreground">{appeal.summary}</p>
              )}
              {showStory && !compact && appeal.story && (
                <div className="mt-4 line-clamp-4 text-muted-foreground">
                  <RichText data={appeal.story} enableGutter={false} />
                </div>
              )}

              <Thermometer
                className="mt-8"
                raised={appeal.raisedAmount}
                target={appeal.targetAmount}
              />

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  className="inline-flex h-12 items-center rounded-full bg-brand px-7 font-medium text-brand-on transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]"
                  href={donateUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {donateLabel}
                </a>
                <Link
                  className="inline-flex h-12 items-center rounded-full border border-foreground/20 px-7 font-medium transition-colors hover:border-foreground/50"
                  href={`/appeals/${appeal.slug}`}
                >
                  Read the story
                </Link>
              </div>
            </div>
          </Reveal>

          {!compact && appeal.coverImage && typeof appeal.coverImage === 'object' && (
            <Reveal delay={0.1}>
              <div className="overflow-hidden rounded-2xl">
                <Media
                  imgClassName="w-full h-auto aspect-4/3 object-cover"
                  resource={appeal.coverImage}
                  size="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
