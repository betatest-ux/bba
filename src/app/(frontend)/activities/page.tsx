import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { ActivitiesGrid, type ActivityCard } from './ActivitiesGrid'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function ActivitiesPage() {
  const payload = await getPayload({ config: configPromise })

  const [projects, categories] = await Promise.all([
    payload.find({
      collection: 'projects',
      depth: 1,
      limit: 100,
      overrideAccess: false,
      select: {
        title: true,
        slug: true,
        summary: true,
        coverImage: true,
        categories: true,
        status: true,
        location: true,
      },
      sort: '-publishedAt',
      where: { _status: { equals: 'published' } },
    }),
    payload.find({
      collection: 'project-categories',
      limit: 50,
      overrideAccess: false,
      sort: 'title',
    }),
  ])

  const cards: ActivityCard[] = projects.docs.map((project) => ({
    id: project.id,
    title: project.title,
    slug: project.slug ?? '',
    summary: project.summary,
    status: project.status,
    location: project.location ?? null,
    categoryIds: (project.categories || []).map((category) =>
      typeof category === 'object' ? category.id : category,
    ),
    categoryTitles: (project.categories || [])
      .filter((category): category is Exclude<typeof category, number> => typeof category === 'object')
      .map((category) => category.title),
    image:
      project.coverImage && typeof project.coverImage === 'object'
        ? {
            alt: project.coverImage.alt ?? project.title,
            height: project.coverImage.height ?? 800,
            url: project.coverImage.sizes?.medium?.url ?? project.coverImage.url ?? '',
            width: project.coverImage.width ?? 1200,
          }
        : null,
  }))

  return (
    <div className="pt-16 pb-24">
      <PageClient />
      <header className="container mb-10">
        <p className="font-display text-sm font-bold uppercase tracking-wider text-brand">
          Our activities
        </p>
        <h1 className="mt-2 text-h1 max-w-2xl">
          What we do, from Bastwell to Bangladesh
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Every project is run with local volunteers and open to everyone. Filter by theme or
          status to find your way in.
        </p>
      </header>

      <ActivitiesGrid
        cards={cards}
        categories={categories.docs.map((category) => ({ id: category.id, title: category.title }))}
      />
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    description:
      'The projects and activities BBAlliance runs across Blackburn with Darwen and beyond.',
    title: 'Our Activities | BBAlliance',
  }
}
