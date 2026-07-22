import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import RichText from '@/components/RichText'
import { Weave } from '@/components/Weave'

/**
 * Branded 404. The wording is editable in the CMS: create/edit a Page with
 * the slug "page-not-found" and its hero text is used here (seeded by
 * default).
 */
export default async function NotFound() {
  let heroRichText: unknown = null
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'pages',
      limit: 1,
      overrideAccess: false,
      where: { slug: { equals: 'page-not-found' } },
    })
    heroRichText = result.docs[0]?.hero?.richText ?? null
  } catch {
    // fall back to the built-in wording
  }

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-28 text-center">
      <Weave className="mb-8 h-6 w-40 text-brand" />
      <p className="font-display text-sm font-bold uppercase tracking-widest text-brand">
        404 — page not found
      </p>
      {heroRichText ? (
        <div className="mt-4 max-w-xl">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <RichText data={heroRichText as any} enableGutter={false} />
        </div>
      ) : (
        <>
          <h1 className="mt-4 text-h1">Well, this street doesn’t exist</h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            The page you’re after may have moved or been renamed. Try the menu, or head back home.
          </p>
        </>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          className="inline-flex h-12 items-center rounded-full bg-brand px-7 font-semibold text-brand-on transition-transform duration-150 hover:scale-[1.03]"
          href="/"
        >
          Back to the homepage
        </Link>
        <Link
          className="inline-flex h-12 items-center rounded-full border border-border px-7 font-medium transition-colors hover:border-foreground/40"
          href="/search"
        >
          Search the site
        </Link>
      </div>
    </div>
  )
}
