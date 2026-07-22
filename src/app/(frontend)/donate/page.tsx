import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import { Thermometer } from '@/blocks/AppealProgress/Thermometer'
import { Reveal } from '@/components/Motion/Reveal'
import RichText from '@/components/RichText'
import { getCachedGlobal } from '@/utilities/getGlobals'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

const providerHost = (url: string): string | null => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

export default async function DonatePage() {
  const payload = await getPayload({ config: configPromise })

  const [donationSettings, currentAppeal] = await Promise.all([
    getCachedGlobal('donation-settings', 0)().catch(() => null),
    payload
      .find({
        collection: 'appeals',
        depth: 0,
        limit: 1,
        overrideAccess: false,
        sort: '-publishedAt',
        where: {
          and: [
            { _status: { equals: 'published' } },
            {
              or: [
                { endDate: { exists: false } },
                { endDate: { greater_than: new Date().toISOString() } },
              ],
            },
          ],
        },
      })
      .then((result) => result.docs[0] ?? null),
  ])

  const donateUrl = donationSettings?.donateUrl || '#'
  const host = providerHost(donateUrl)

  return (
    <div className="pt-16 pb-24">
      <PageClient />
      <header className="container mb-12">
        <p className="font-display text-sm font-bold uppercase tracking-wider text-brand">Donate</p>
        <h1 className="mt-2 text-h1 max-w-2xl">Every pound stays close to home</h1>
        {donationSettings?.appealText ? (
          <div className="mt-4 max-w-2xl text-lg text-muted-foreground">
            <RichText data={donationSettings.appealText} enableGutter={false} />
          </div>
        ) : (
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Your gift funds the food pantry, youth clubs, elders’ groups and education projects
            here in Blackburn and Darwen — and trusted partner projects further afield.
          </p>
        )}
        <div className="mt-8">
          <a
            className="inline-flex h-14 items-center rounded-full bg-brand px-10 text-lg font-semibold text-brand-on transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]"
            href={donateUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {donationSettings?.donateLabel || 'Donate'}
          </a>
          {host && (
            <p className="mt-3 text-sm text-muted-foreground">
              You’ll be taken to our secure donation page on <strong>{host}</strong>. No card
              details ever touch this website.
            </p>
          )}
        </div>
      </header>

      {/* What your gift does */}
      <section aria-label="What your gift does" className="container">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { amount: '£10', text: 'buys a heated blanket for a cold home [PLACEHOLDER — check]' },
            { amount: '£25', text: 'fills a family’s pantry basket for a fortnight [PLACEHOLDER — check]' },
            { amount: '£50', text: 'runs a youth club session for 30 young people [PLACEHOLDER — check]' },
          ].map((tile, index) => (
            <Reveal delay={index * 0.07} key={tile.amount}>
              <div className="thread-top h-full rounded-2xl border border-border bg-card p-7">
                <p className="font-display text-4xl font-bold text-brand">{tile.amount}</p>
                <p className="mt-2 text-muted-foreground">{tile.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Gift Aid */}
      <section aria-labelledby="gift-aid-heading" className="container mt-14">
        <div className="rounded-3xl border border-gold/40 bg-gold/15 p-8 md:p-10">
          <h2 className="text-h2" id="gift-aid-heading">
            Gift Aid — 25% extra, at no cost to you
          </h2>
          {donationSettings?.giftAidText ? (
            <div className="mt-3 max-w-2xl">
              <RichText data={donationSettings.giftAidText} enableGutter={false} />
            </div>
          ) : (
            <p className="mt-3 max-w-2xl">
              If you’re a UK taxpayer, ticking the Gift Aid box adds 25p to every £1 you give —
              the government tops it up, and it costs you nothing.
            </p>
          )}
        </div>
      </section>

      {/* Current appeal */}
      {currentAppeal && (
        <section aria-labelledby="appeal-heading" className="container mt-14">
          <div className="grid items-center gap-8 rounded-3xl bg-secondary p-8 md:p-10 lg:grid-cols-2">
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-wider text-brand">
                Current appeal
              </p>
              <h2 className="mt-2 text-h2" id="appeal-heading">
                <Link className="hover:underline" href={`/appeals/${currentAppeal.slug}`}>
                  {currentAppeal.title}
                </Link>
              </h2>
              <p className="mt-3 text-muted-foreground">{currentAppeal.summary}</p>
            </div>
            <div>
              <Thermometer raised={currentAppeal.raisedAmount} target={currentAppeal.targetAmount} />
              <Link
                className="mt-6 inline-flex h-11 items-center rounded-full border border-foreground/20 px-6 font-medium transition-colors hover:border-foreground/50"
                href={`/appeals/${currentAppeal.slug}`}
              >
                Read the story →
              </Link>
            </div>
          </div>
        </section>
      )}

      <p className="container mt-12 text-sm text-muted-foreground">
        Donations are processed by our external donation provider. Prefer to give another way?{' '}
        <Link className="underline" href="/contact">
          Get in touch
        </Link>{' '}
        about standing orders, cheques or legacy gifts.
      </p>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    description:
      'Donate to BBAlliance — support the food pantry, youth clubs and elders’ groups in Blackburn and Darwen. Gift Aid adds 25% at no cost to you.',
    title: 'Donate | BBAlliance',
  }
}
