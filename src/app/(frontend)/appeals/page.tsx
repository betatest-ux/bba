import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import type { Appeal } from '@/payload-types'

import { Thermometer } from '@/blocks/AppealProgress/Thermometer'
import { Media } from '@/components/Media'
import { Reveal } from '@/components/Motion/Reveal'
import { getCachedGlobal } from '@/utilities/getGlobals'

import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

const gbp = (value: number): string =>
  new Intl.NumberFormat('en-GB', {
    currency: 'GBP',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)

const isCurrent = (appeal: Appeal, now: number): boolean =>
  !appeal.endDate || new Date(appeal.endDate).getTime() > now

export default async function AppealsPage() {
  const payload = await getPayload({ config: configPromise })

  const [appeals, donationSettings] = await Promise.all([
    payload.find({
      collection: 'appeals',
      depth: 1,
      limit: 100,
      overrideAccess: false,
      sort: '-publishedAt',
      where: { _status: { equals: 'published' } },
    }),
    getCachedGlobal('donation-settings')().catch(() => null),
  ])

  const now = Date.now()
  const current = appeals.docs.filter((appeal) => isCurrent(appeal, now))
  const past = appeals.docs.filter((appeal) => !isCurrent(appeal, now))
  const fallbackDonateUrl = donationSettings?.donateUrl || '/donate'

  return (
    <div className="pt-16 pb-24">
      <PageClient />
      <header className="container mb-10">
        <p className="font-display text-sm font-bold uppercase tracking-wider text-brand">
          Appeals
        </p>
        <h1 className="mt-2 text-h1 max-w-2xl">Give where it&apos;s needed most</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          When something urgent comes up — at home in Blackburn with Darwen or further afield — we
          raise funds openly and show you exactly how far each appeal has got.
        </p>
      </header>

      {/* Current appeals */}
      <section aria-labelledby="current-appeals-heading" className="container">
        <h2 className="text-h2 mb-8" id="current-appeals-heading">
          Current appeals
        </h2>

        {current.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <p className="font-medium">There are no live appeals right now.</p>
            <p className="mt-2 text-muted-foreground">
              You can still support our everyday work across the borough and beyond.
            </p>
            <Link
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 font-medium text-brand-on transition-transform duration-150 hover:scale-[1.03]"
              href="/donate"
            >
              Donate to our work
            </Link>
          </div>
        ) : (
          <ul className="space-y-8 list-none p-0">
            {current.map((appeal, index) => {
              const donateHref = appeal.donateUrl || fallbackDonateUrl
              const donateExternal = donateHref.startsWith('http')

              return (
                <Reveal as="li" delay={index * 0.06} key={appeal.id}>
                  <article className="grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-2">
                    {appeal.coverImage && typeof appeal.coverImage === 'object' ? (
                      <div className="relative min-h-56 overflow-hidden bg-loom md:min-h-full">
                        <Media
                          fill
                          imgClassName="object-cover"
                          resource={appeal.coverImage}
                          size="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    ) : (
                      <div aria-hidden className="hidden bg-brand-soft md:block" />
                    )}
                    <div className="p-6 md:p-8">
                      <h3 className="text-h3">
                        <Link className="hover:underline" href={`/appeals/${appeal.slug}`}>
                          {appeal.title}
                        </Link>
                      </h3>
                      <p className="mt-3 text-muted-foreground">{appeal.summary}</p>
                      <Thermometer
                        className="mt-6"
                        raised={appeal.raisedAmount}
                        target={appeal.targetAmount}
                      />
                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <a
                          className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-6 font-medium text-brand-on transition-transform duration-150 hover:scale-[1.03]"
                          href={donateHref}
                          {...(donateExternal
                            ? { rel: 'noopener noreferrer', target: '_blank' }
                            : {})}
                        >
                          Donate to this appeal
                        </a>
                        <Link
                          className="inline-flex h-12 items-center justify-center rounded-full border border-border px-6 font-medium transition-colors duration-150 hover:border-foreground/40"
                          href={`/appeals/${appeal.slug}`}
                        >
                          Read the story
                        </Link>
                      </div>
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </ul>
        )}
      </section>

      {/* Past appeals */}
      {past.length > 0 && (
        <section aria-labelledby="past-appeals-heading" className="container mt-20">
          <h2 className="text-h2 mb-3" id="past-appeals-heading">
            Past appeals
          </h2>
          <p className="mb-8 max-w-2xl text-muted-foreground">
            Appeals that have finished — thank you to everyone who gave.
          </p>
          <ul className="grid gap-6 list-none p-0 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((appeal, index) => (
              <Reveal as="li" delay={(index % 3) * 0.05} key={appeal.id}>
                <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
                  <span className="self-start rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                    Completed
                  </span>
                  <h3 className="mt-3 text-h3">
                    <Link className="hover:underline" href={`/appeals/${appeal.slug}`}>
                      {appeal.title}
                    </Link>
                  </h3>
                  <p className="mt-2 font-medium text-brand">
                    Raised {gbp(appeal.raisedAmount)} of {gbp(appeal.targetAmount)}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {appeal.summary}
                  </p>
                </article>
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    description:
      'Current and past fundraising appeals from BBAlliance — see how each one is going and give where it helps most.',
    title: 'Appeals | BBAlliance',
  }
}
