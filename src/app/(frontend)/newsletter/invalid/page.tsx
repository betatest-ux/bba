import type { Metadata } from 'next/types'

import Link from 'next/link'
import React from 'react'

import { Weave } from '@/components/Weave'

export default function Page() {
  return (
    <div className="container flex min-h-[50vh] flex-col items-center justify-center py-24 text-center">
      <Weave className="mb-8 h-6 w-40 text-brand" />
      <h1 className="font-display text-h1">That link didn’t work</h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">It may have expired or been used already. You can sign up again from the footer of any page, or contact us if something seems wrong.</p>
      <Link
        className="mt-8 inline-flex h-12 items-center rounded-full bg-brand px-7 font-semibold text-brand-on transition-transform duration-150 hover:scale-[1.03]"
        href="/"
      >
        Back to the homepage
      </Link>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    robots: { follow: false, index: false },
    title: 'Link problem' + ' | BBAlliance',
  }
}
