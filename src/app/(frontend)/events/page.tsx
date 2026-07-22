import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import { Media } from '@/components/Media'
import { Reveal } from '@/components/Motion/Reveal'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

const dateBadge = (iso: string): { day: string; month: string } => {
  const date = new Date(iso)
  return {
    day: date.toLocaleDateString('en-GB', { day: '2-digit', timeZone: 'Europe/London' }),
    month: date.toLocaleDateString('en-GB', { month: 'short', timeZone: 'Europe/London' }),
  }
}

const formatCardDate = (iso: string): string => {
  const date = new Date(iso)
  const day = date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London',
  })
  const time = date.toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Europe/London',
  })
  return `${day}, ${time}`
}

const formatPastDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/London',
  })

export default async function EventsPage() {
  const payload = await getPayload({ config: configPromise })
  const now = new Date().toISOString()

  const [upcoming, past] = await Promise.all([
    payload.find({
      collection: 'events',
      depth: 1,
      limit: 24,
      overrideAccess: false,
      sort: 'startDate',
      where: {
        and: [{ startDate: { greater_than: now } }, { _status: { equals: 'published' } }],
      },
    }),
    payload.find({
      collection: 'events',
      depth: 0,
      limit: 6,
      overrideAccess: false,
      select: {
        title: true,
        slug: true,
        startDate: true,
        venue: true,
      },
      sort: '-startDate',
      where: {
        and: [{ startDate: { less_than: now } }, { _status: { equals: 'published' } }],
      },
    }),
  ])

  return (
    <div className="pt-16 pb-24">
      <PageClient />
      <header className="container mb-10">
        <p className="font-display text-sm font-bold uppercase tracking-wider text-brand">
          What&apos;s on
        </p>
        <h1 className="mt-2 text-h1 max-w-2xl">Events and gatherings</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          From community meals to fundraising walks, everything we run is open to all. Come along —
          you&apos;ll be made very welcome.
        </p>
      </header>

      <section aria-labelledby="upcoming-events" className="container">
        <h2 className="sr-only" id="upcoming-events">
          Upcoming events
        </h2>
        {upcoming.docs.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <p className="font-display text-lg font-bold">Nothing in the diary just yet</p>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              We&apos;re busy planning our next get-togethers. Check back soon, or drop us a line
              and we&apos;ll let you know what&apos;s coming up.
            </p>
            <Link
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 font-medium text-brand-on transition-transform duration-150 hover:scale-[1.03]"
              href="/contact"
            >
              Get in touch
            </Link>
          </div>
        ) : (
          <ul className="grid gap-6 list-none p-0 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.docs.map((event, index) => {
              const badge = dateBadge(event.startDate)
              return (
                <Reveal as="li" delay={(index % 3) * 0.07} key={event.id}>
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
                        <p className="font-display text-xl font-bold leading-none text-brand">
                          {badge.day}
                        </p>
                        <p className="text-xs font-medium uppercase">{badge.month}</p>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-h3">{event.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatCardDate(event.startDate)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{event.venue}</p>
                      {event.summary && (
                        <p className="mt-3 line-clamp-2 text-muted-foreground">{event.summary}</p>
                      )}
                      {event.recurrenceNote && (
                        <p className="mt-3 inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-medium">
                          {event.recurrenceNote}
                        </p>
                      )}
                    </div>
                  </Link>
                </Reveal>
              )
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="past-events" className="container mt-20">
        <h2 className="text-h2" id="past-events">
          Past events
        </h2>
        {past.docs.length === 0 ? (
          <p className="mt-4 text-muted-foreground">
            Once events have taken place, they&apos;ll appear here.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-border list-none p-0">
            {past.docs.map((event) => (
              <li key={event.id}>
                <Link
                  className="group flex min-h-11 flex-wrap items-baseline gap-x-4 gap-y-1 py-3 text-sm"
                  href={`/events/${event.slug}`}
                >
                  <time className="w-28 shrink-0 text-muted-foreground" dateTime={event.startDate}>
                    {formatPastDate(event.startDate)}
                  </time>
                  <span className="font-medium group-hover:underline">{event.title}</span>
                  <span className="text-muted-foreground">{event.venue}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    description:
      'Upcoming events, gatherings and fundraisers from BBAlliance in Blackburn with Darwen.',
    title: "What's On | BBAlliance",
  }
}
