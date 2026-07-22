import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import React, { cache } from 'react'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const events = await payload.find({
    collection: 'events',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return events.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{ slug?: string }>
}

const dateOptions: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/London',
}

const timeOptions: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'Europe/London',
}

const formatEventDates = (startISO: string, endISO?: string | null): string => {
  const start = new Date(startISO)
  const startText = `${start.toLocaleDateString('en-GB', dateOptions)}, ${start.toLocaleTimeString('en-GB', timeOptions)}`

  if (!endISO) return startText

  const end = new Date(endISO)
  const sameDay =
    start.toLocaleDateString('en-GB', { timeZone: 'Europe/London' }) ===
    end.toLocaleDateString('en-GB', { timeZone: 'Europe/London' })

  if (sameDay) {
    return `${startText} – ${end.toLocaleTimeString('en-GB', timeOptions)}`
  }

  return `${startText} – ${end.toLocaleDateString('en-GB', dateOptions)}, ${end.toLocaleTimeString('en-GB', timeOptions)}`
}

export default async function EventPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/events/' + decodedSlug
  const event = await queryEventBySlug({ slug: decodedSlug })

  if (!event) return <PayloadRedirects url={url} />

  const isPast = new Date(event.startDate).getTime() < Date.now()
  const formattedDates = formatEventDates(event.startDate, event.endDate)

  const coverImageUrl =
    event.coverImage && typeof event.coverImage === 'object' && event.coverImage.url
      ? `${getServerSideURL()}${event.coverImage.url}`
      : undefined

  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.startDate,
    ...(event.endDate ? { endDate: event.endDate } : {}),
    location: { '@type': 'Place', name: event.venue },
    ...(event.summary ? { description: event.summary } : {}),
    url: `${getServerSideURL()}${url}`,
    ...(coverImageUrl ? { image: coverImageUrl } : {}),
  }

  return (
    <article className="pb-24">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        type="application/ld+json"
      />

      {/* Hero */}
      <header className="bg-loom text-white">
        <div className="container py-14 md:py-20">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/70">
            <ol className="flex flex-wrap gap-2 list-none p-0">
              <li>
                <Link className="hover:text-white" href="/">
                  Home
                </Link>
                <span aria-hidden className="ms-2">/</span>
              </li>
              <li>
                <Link className="hover:text-white" href="/events">
                  What&apos;s on
                </Link>
                <span aria-hidden className="ms-2">/</span>
              </li>
              <li aria-current="page" className="text-white">
                {event.title}
              </li>
            </ol>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              {event.recurrenceNote && (
                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  {event.recurrenceNote}
                </span>
              )}
              <h1 className="mt-4 text-h1">{event.title}</h1>
              <p className="mt-4 text-lg text-white/85">{formattedDates}</p>
              <p className="mt-2 text-white/70">{event.venue}</p>
              {event.summary && <p className="mt-4 text-lg text-white/85">{event.summary}</p>}
            </div>
            {event.coverImage && typeof event.coverImage === 'object' && (
              <div className="overflow-hidden rounded-2xl">
                <Media
                  imgClassName="w-full h-auto aspect-3/2 object-cover"
                  priority
                  resource={event.coverImage}
                  size="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="container mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div>
          <RichText className="max-w-none ms-0" data={event.description} enableGutter={false} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:pt-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold">Event details</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-medium">When</dt>
                <dd className="mt-1 text-muted-foreground">{formattedDates}</dd>
                {event.recurrenceNote && (
                  <dd className="mt-1 text-muted-foreground">{event.recurrenceNote}</dd>
                )}
              </div>
              <div>
                <dt className="font-medium">Where</dt>
                <dd className="mt-1 text-muted-foreground">{event.venue}</dd>
              </div>
            </dl>

            {isPast ? (
              <p
                className="mt-5 rounded-xl bg-secondary p-4 text-sm text-muted-foreground"
                role="status"
              >
                This event has already happened. Have a look at{' '}
                <Link className="underline hover:text-brand" href="/events">
                  what else is coming up
                </Link>
                .
              </p>
            ) : (
              <div className="mt-5 flex flex-col gap-3">
                {event.bookingLink && (
                  <a
                    className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 font-medium text-brand-on transition-transform duration-150 hover:scale-[1.03]"
                    href={event.bookingLink}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Book a place
                  </a>
                )}
                <a
                  className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 font-medium transition-colors hover:border-foreground/40"
                  download
                  href={`/events/${event.slug}/calendar.ics`}
                >
                  Add to calendar
                </a>
              </div>
            )}
          </div>
        </aside>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const event = await queryEventBySlug({ slug: decodeURIComponent(slug) })

  if (!event) return { title: 'Event | BBAlliance' }

  const title = event.meta?.title || `${event.title} | BBAlliance`
  const description = event.meta?.description || event.summary || undefined

  const metaImage = event.meta?.image
  const ogImage =
    metaImage && typeof metaImage === 'object' && metaImage.url
      ? getServerSideURL() + (metaImage.sizes?.og?.url || metaImage.url)
      : undefined

  return {
    description,
    openGraph: mergeOpenGraph({
      description: description || '',
      images: ogImage ? [{ url: ogImage }] : undefined,
      title,
      url: `/events/${event.slug}`,
    }),
    title,
  }
}

const queryEventBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'events',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  return result.docs?.[0] || null
})
