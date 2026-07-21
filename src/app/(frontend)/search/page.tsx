import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { getCollectionPath } from '@/utilities/collectionPaths'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}

const collectionLabels: Record<string, string> = {
  events: 'Event',
  faqs: 'FAQ',
  news: 'News',
  pages: 'Page',
  projects: 'Project',
}

export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise
  const payload = await getPayload({ config: configPromise })

  const results = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 24,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      doc: true,
    },
    // pagination: false reduces overhead if you don't need totalDocs
    pagination: false,
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">Search</h1>

          <div className="max-w-[50rem] mx-auto">
            <Search />
          </div>
        </div>
      </div>

      <div className="container" aria-live="polite">
        {results.totalDocs > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 list-none p-0">
            {results.docs.map((result) => {
              const relationTo =
                typeof result.doc === 'object' ? result.doc.relationTo : undefined
              const href =
                relationTo === 'faqs'
                  ? '/faqs'
                  : getCollectionPath(relationTo ?? 'pages', result.slug)

              return (
                <li key={result.id}>
                  <Link
                    className="block h-full border border-border rounded-lg p-6 bg-card hover:border-foreground/30 transition-colors"
                    href={href}
                  >
                    {relationTo && (
                      <span className="uppercase text-xs tracking-wide text-muted-foreground">
                        {collectionLabels[relationTo] ?? relationTo}
                      </span>
                    )}
                    <h2 className="text-xl font-semibold mt-1">{result.title}</h2>
                    {result.meta?.description && (
                      <p className="mt-2 text-muted-foreground">{result.meta.description}</p>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-center">
            {query ? `No results for “${query}”.` : 'Type above to search the site.'}
          </p>
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Search | BBAlliance`,
  }
}
