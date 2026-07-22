import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import React, { cache } from 'react'

import type { Project } from '@/payload-types'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import RichText from '@/components/RichText'
import { generateMeta } from '@/utilities/generateMeta'
import { getServerSideURL } from '@/utilities/getURL'
import { CountdownBadge } from '../CountdownBadge'
import { ApplicationForm } from './ApplicationForm'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const vacancies = await payload.find({
    collection: 'vacancies',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return vacancies.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{ slug?: string }>
}

const formatClosingDate = (value: string): string =>
  new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export default async function VacancyPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/jobs/' + decodedSlug
  const vacancy = await queryVacancyBySlug({ slug: decodedSlug })

  if (!vacancy) return <PayloadRedirects url={url} />

  const isPaid = vacancy.vacancyType === 'paid'
  const isClosed = new Date(vacancy.closingDate).getTime() <= Date.now()

  const jobPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    ...(vacancy.publishedAt ? { datePosted: vacancy.publishedAt } : {}),
    employmentType: isPaid ? 'PART_TIME' : 'VOLUNTEER',
    hiringOrganization: {
      '@type': 'Organization',
      name: 'BBAlliance',
      url: getServerSideURL(),
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: vacancy.location,
      },
    },
    title: vacancy.title,
    validThrough: vacancy.closingDate,
  }

  const facts: { label: string; value: string }[] = [
    { label: 'Role type', value: isPaid ? 'Paid' : 'Voluntary' },
    { label: 'Location', value: vacancy.location },
    ...(vacancy.hours ? [{ label: 'Hours', value: vacancy.hours }] : []),
    { label: 'Salary', value: vacancy.salary || 'Voluntary' },
    { label: 'Closing date', value: formatClosingDate(vacancy.closingDate) },
  ]

  return (
    <article className="pb-24">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
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
                <Link className="hover:text-white" href="/jobs">
                  Work with us
                </Link>
                <span aria-hidden className="ms-2">/</span>
              </li>
              <li aria-current="page" className="text-white">
                {vacancy.title}
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              {isPaid ? 'Paid role' : 'Volunteer role'}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              {vacancy.location}
            </span>
            {!isClosed && <CountdownBadge closingDate={vacancy.closingDate} />}
          </div>
          <h1 className="mt-4 text-h1 max-w-3xl">{vacancy.title}</h1>
          <p className="mt-4 text-lg text-white/85">
            {isClosed
              ? 'This role has now closed.'
              : `Applications close on ${formatClosingDate(vacancy.closingDate)}.`}
          </p>
        </div>
      </header>

      {/* Body */}
      <div className="container mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div>
          <RichText className="max-w-none ms-0" data={vacancy.description} enableGutter={false} />

          <section aria-labelledby="apply-heading" className="mt-14" id="apply">
            <h2 className="text-h2" id="apply-heading">
              {isClosed ? 'Applications closed' : 'Apply for this role'}
            </h2>

            {isClosed ? (
              <div
                className="mt-6 rounded-2xl border border-border bg-secondary p-8"
                role="status"
              >
                <p className="font-medium">
                  Applications closed on {formatClosingDate(vacancy.closingDate)}.
                </p>
                <p className="mt-2 text-muted-foreground">
                  Thanks for your interest — we’re no longer accepting applications for this role.
                  Keep an eye on our{' '}
                  <Link className="underline hover:text-brand" href="/jobs">
                    work with us
                  </Link>{' '}
                  page for new openings, or explore other{' '}
                  <Link className="underline hover:text-brand" href="/get-involved">
                    ways to get involved
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <>
                <p className="mt-2 mb-8 max-w-2xl text-muted-foreground">
                  Tell us a little about yourself and attach your CV. If you’d rather chat first,
                  we’re always happy to hear from you before you apply.
                </p>
                <ApplicationForm vacancyId={vacancy.id} vacancyTitle={vacancy.title} />
              </>
            )}
          </section>
        </div>

        {/* Sidebar facts card */}
        <aside className="lg:pt-2">
          <div className="rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-bold">At a glance</h2>
            <dl className="mt-4 space-y-3">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-sm text-muted-foreground">{fact.label}</dt>
                  <dd className="font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
            {!isClosed && (
              <a
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-brand px-6 font-medium text-brand-on transition-transform duration-150 hover:scale-[1.03]"
                href="#apply"
              >
                Apply now
              </a>
            )}
          </div>
        </aside>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const vacancy = await queryVacancyBySlug({ slug: decodeURIComponent(slug) })
  return generateMeta({ doc: vacancy as Partial<Project> | null })
}

const queryVacancyBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'vacancies',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  return result.docs?.[0] || null
})
