import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import type { EventsStripBlock as EventsStripBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'
import { Reveal } from '@/components/Motion/Reveal'

const dateBadge = (iso: string): { day: string; month: string } => {
  const date = new Date(iso)
  return {
    day: date.toLocaleDateString('en-GB', { day: '2-digit' }),
    month: date.toLocaleDateString('en-GB', { month: 'short' }),
  }
}

export const EventsStripBlock: React.FC<EventsStripBlockProps> = async ({ heading, limit }) => {
  const payload = await getPayload({ config: configPromise })
  const events = await payload.find({
    collection: 'events',
    limit: limit ?? 3,
    overrideAccess: false,
    sort: 'startDate',
    where: {
      startDate: { greater_than: new Date().toISOString() },
      _status: { equals: 'published' },
    },
  })

  if (events.docs.length === 0) return null

  return (
    <section className="py-14 md:py-20 bg-secondary">
      <div className="container">
        <Reveal>
          <div className="mb-10 flex items-end justify-between gap-4">
            <h2 className="text-h2">{heading || 'What’s on'}</h2>
            <Link className="font-medium text-brand hover:underline" href="/events">
              All events →
            </Link>
          </div>
        </Reveal>
        <ul className="grid gap-6 md:grid-cols-3 list-none p-0">
          {events.docs.map((event, index) => {
            const badge = dateBadge(event.startDate)
            return (
              <Reveal as="li" delay={index * 0.07} key={event.id}>
                <Link
                  className="thread-top group block h-full overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
                  href={`/events/${event.slug}`}
                >
                  <div className="relative">
                    {event.coverImage && typeof event.coverImage === 'object' ? (
                      <Media
                        imgClassName="aspect-3/2 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        resource={event.coverImage}
                        size="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="aspect-3/2 w-full bg-loom" />
                    )}
                    <div className="absolute left-4 top-4 rounded-xl bg-background px-3 py-2 text-center shadow">
                      <p className="font-display text-xl font-bold leading-none text-brand">{badge.day}</p>
                      <p className="text-xs font-medium uppercase">{badge.month}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-h3">{event.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{event.venue}</p>
                    {event.summary && <p className="mt-3 line-clamp-2 text-muted-foreground">{event.summary}</p>}
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
