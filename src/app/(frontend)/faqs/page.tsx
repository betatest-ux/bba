import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import { lexicalToPlainText } from '@/utilities/lexicalToPlainText'
import { FAQSearch, type FAQGroup } from './FAQSearch'

export const dynamic = 'force-static'
export const revalidate = 600

const categoryOrder = ['general', 'volunteering', 'donations', 'projects', 'jobs'] as const
const categoryLabels: Record<string, string> = {
  donations: 'Donations',
  general: 'General',
  jobs: 'Jobs',
  projects: 'Projects',
  volunteering: 'Volunteering',
}

export default async function FAQsPage() {
  const payload = await getPayload({ config: configPromise })

  const faqs = await payload.find({
    collection: 'faqs',
    depth: 0,
    limit: 200,
    overrideAccess: false,
    sort: 'displayOrder',
  })

  const groups: FAQGroup[] = categoryOrder
    .map((category) => ({
      items: faqs.docs
        .filter((faq) => faq.category === category)
        .map((faq) => ({
          answer: faq.answer,
          id: String(faq.id),
          plain: lexicalToPlainText(faq.answer),
          question: faq.question,
        })),
      title: categoryLabels[category],
    }))
    .filter((group) => group.items.length > 0)

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: groups.flatMap((group) =>
      group.items.map((item) => ({
        '@type': 'Question',
        acceptedAnswer: { '@type': 'Answer', text: item.plain },
        name: item.question,
      })),
    ),
  }

  return (
    <div className="pt-16 pb-24">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        type="application/ld+json"
      />
      <header className="container mb-10">
        <p className="font-display text-sm font-bold uppercase tracking-wider text-brand">Help</p>
        <h1 className="mt-2 text-h1">Frequently asked questions</h1>
      </header>

      <div className="container max-w-3xl">
        <FAQSearch groups={groups} />

        <p className="mt-12 rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
          Can’t find what you need?{' '}
          <Link className="font-medium text-brand underline" href="/contact">
            Ask us directly
          </Link>{' '}
          — we reply within two working days.
        </p>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    description: 'Answers to common questions about volunteering, donating and BBAlliance’s work.',
    title: 'FAQs | BBAlliance',
  }
}
