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
import { Thermometer } from '@/blocks/AppealProgress/Thermometer'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const appeals = await payload.find({
    collection: 'appeals',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return appeals.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{ slug?: string }>
}

const gbp = (value: number): string =>
  new Intl.NumberFormat('en-GB', {
    currency: 'GBP',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)

export default async function AppealPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/appeals/' + decodedSlug
  const appeal = await queryAppealBySlug({ slug: decodedSlug })

  if (!appeal) return <PayloadRedirects url={url} />

  const donationSettings = await getCachedGlobal('donation-settings')().catch(() => null)
  const generalDonateUrl = donationSettings?.donateUrl || '/donate'

  const finished = Boolean(appeal.endDate && new Date(appeal.endDate).getTime() <= Date.now())
  const donateHref = finished ? generalDonateUrl : appeal.donateUrl || generalDonateUrl
  const donateExternal = donateHref.startsWith('http')
  const donateLinkProps = donateExternal
    ? { rel: 'noopener noreferrer', target: '_blank' }
    : {}

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', item: `${getServerSideURL()}/`, name: 'Home', position: 1 },
      { '@type': 'ListItem', item: `${getServerSideURL()}/appeals`, name: 'Appeals', position: 2 },
      { '@type': 'ListItem', item: `${getServerSideURL()}${url}`, name: appeal.title, position: 3 },
    ],
  }

  return (
    <article className="pb-24">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        type="application/ld+json"
      />

      {/* Header band */}
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
                <Link className="hover:text-white" href="/appeals">
                  Appeals
                </Link>
                <span aria-hidden className="ms-2">/</span>
              </li>
              <li aria-current="page" className="text-white">
                {appeal.title}
              </li>
            </ol>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-wider text-white/80">
                {finished ? 'Past appeal' : 'Appeal'}
              </p>
              <h1 className="mt-2 text-h1">{appeal.title}</h1>
              <p className="mt-4 text-lg text-white/85">{appeal.summary}</p>
            </div>
            {appeal.coverImage && typeof appeal.coverImage === 'object' && (
              <div className="overflow-hidden rounded-2xl">
                <Media
                  imgClassName="w-full h-auto aspect-3/2 object-cover"
                  priority
                  resource={appeal.coverImage}
                  size="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Progress band */}
      <section aria-label="Appeal progress" className="border-b border-border bg-secondary">
        <div className="container py-10">
          <Thermometer
            className="max-w-2xl"
            raised={appeal.raisedAmount}
            target={appeal.targetAmount}
          />
        </div>
      </section>

      {finished && (
        <div className="container mt-10">
          <div className="rounded-2xl border border-border bg-brand-soft p-6 md:p-8" role="status">
            <p className="font-display text-lg font-bold">
              This appeal has finished — thank you
            </p>
            <p className="mt-2 text-muted-foreground">
              Together we raised {gbp(appeal.raisedAmount)} towards a{' '}
              {gbp(appeal.targetAmount)} target. If you&apos;d still like to give, your donation
              will go to our general fund and support all of our work.
            </p>
          </div>
        </div>
      )}

      {/* Story + donate sidebar */}
      <div className="container mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="sr-only">The story</h2>
          <RichText className="max-w-none ms-0" data={appeal.story} enableGutter={false} />
        </div>

        <aside aria-label="Donate to this appeal">
          <div className="rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-bold">
              {finished ? 'Keep supporting our work' : 'Support this appeal'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {finished
                ? 'This appeal has closed, but every donation still makes a difference across Blackburn with Darwen and beyond.'
                : 'Every pound goes towards the target above — and we update the total as donations come in.'}
            </p>
            <a
              className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-6 font-medium text-brand-on transition-transform duration-150 hover:scale-[1.03]"
              href={donateHref}
              {...donateLinkProps}
            >
              {donationSettings?.donateLabel || 'Donate now'}
            </a>
            <p className="mt-3 text-xs text-muted-foreground">
              Donations are processed securely by our payment provider.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              UK taxpayer? Gift Aid adds 25% to your gift at no extra cost —{' '}
              <Link className="underline hover:text-brand" href="/donate">
                find out how on our donate page
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const appeal = await queryAppealBySlug({ slug: decodeURIComponent(slug) })

  if (!appeal) return { title: 'Appeal | BBAlliance' }

  const title = appeal.meta?.title || `${appeal.title} | BBAlliance`
  const description = appeal.meta?.description || appeal.summary || undefined

  const metaImage = appeal.meta?.image
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
      url: `/appeals/${appeal.slug}`,
    }),
    title,
  }
}

const queryAppealBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'appeals',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  return result.docs?.[0] || null
})
