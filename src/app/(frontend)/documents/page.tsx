import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { DocumentsList, type DocumentRow } from './DocumentsList'

export const dynamic = 'force-static'
export const revalidate = 600

const categoryLabels: Record<string, string> = {
  accounts: 'Accounts',
  minutes: 'Meeting minutes',
  other: 'Other',
  policy: 'Policy',
  report: 'Annual report',
}

export default async function DocumentsPage() {
  const payload = await getPayload({ config: configPromise })

  const documents = await payload.find({
    collection: 'library-documents',
    depth: 0,
    limit: 200,
    overrideAccess: false,
    sort: '-year',
  })

  const rows: DocumentRow[] = documents.docs.map((doc) => ({
    category: doc.documentCategory,
    categoryLabel: categoryLabels[doc.documentCategory] ?? doc.documentCategory,
    description: doc.description ?? null,
    filesize: doc.filesize ?? null,
    id: doc.id,
    title: doc.title,
    url: doc.url ?? '#',
    year: doc.year,
  }))

  return (
    <div className="pt-16 pb-24">
      <header className="container mb-10">
        <p className="font-display text-sm font-bold uppercase tracking-wider text-brand">
          Transparency
        </p>
        <h1 className="mt-2 text-h1">Reports &amp; documents</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Our annual reports, accounts, policies and meeting minutes — published for everyone, as
          our funders and the Charity Commission rightly expect.
        </p>
      </header>

      <div className="container">
        <DocumentsList documents={rows} />
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    description:
      'Annual reports, accounts, policies and meeting minutes from BBAlliance — published for transparency.',
    title: 'Reports & documents | BBAlliance',
  }
}
