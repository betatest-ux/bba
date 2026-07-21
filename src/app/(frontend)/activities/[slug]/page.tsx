import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import React, { cache } from 'react'

import type { Project } from '@/payload-types'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Media } from '@/components/Media'
import { CountUp } from '@/components/Motion/CountUp'
import { Reveal } from '@/components/Motion/Reveal'
import RichText from '@/components/RichText'
import { Weave } from '@/components/Weave'
import { generateMeta } from '@/utilities/generateMeta'
import { getServerSideURL } from '@/utilities/getURL'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const projects = await payload.find({
    collection: 'projects',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return projects.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{ slug?: string }>
}

const statusLabels: Record<NonNullable<Project['status']>, string> = {
  completed: 'Completed',
  ongoing: 'Ongoing',
  upcoming: 'Coming soon',
}

export default async function ProjectPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/activities/' + decodedSlug
  const project = await queryProjectBySlug({ slug: decodedSlug })

  if (!project) return <PayloadRedirects url={url} />

  const categories = (project.categories || []).filter(
    (category): category is Exclude<(typeof project.categories)[number], number> =>
      typeof category === 'object',
  )

  const related = await queryRelated({
    categoryIds: categories.map((category) => category.id),
    excludeId: project.id,
  })

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', item: `${getServerSideURL()}/`, name: 'Home', position: 1 },
      { '@type': 'ListItem', item: `${getServerSideURL()}/activities`, name: 'Our activities', position: 2 },
      { '@type': 'ListItem', item: `${getServerSideURL()}${url}`, name: project.title, position: 3 },
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

      {/* Hero */}
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
                <Link className="hover:text-white" href="/activities">
                  Our activities
                </Link>
                <span aria-hidden className="ms-2">/</span>
              </li>
              <li aria-current="page" className="text-white">
                {project.title}
              </li>
            </ol>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  {statusLabels[project.status]}
                </span>
                {categories.map((category) => (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold" key={category.id}>
                    {category.title}
                  </span>
                ))}
              </div>
              <h1 className="mt-4 text-h1">{project.title}</h1>
              <p className="mt-4 text-lg text-white/85">{project.summary}</p>
              {project.location && <p className="mt-4 text-white/70">📍 {project.location}</p>}
            </div>
            {project.coverImage && typeof project.coverImage === 'object' && (
              <div className="overflow-hidden rounded-2xl">
                <Media
                  imgClassName="w-full h-auto aspect-3/2 object-cover"
                  priority
                  resource={project.coverImage}
                  size="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Impact stats */}
      {project.impactStats && project.impactStats.length > 0 && (
        <section aria-label="Impact" className="border-b border-border bg-secondary">
          <div className="container py-10">
            <dl className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
              {project.impactStats.map((stat, index) => (
                <Reveal delay={index * 0.06} key={stat.id ?? index}>
                  <div>
                    <dd className="font-display text-4xl font-bold text-brand">
                      <CountUp prefix={stat.prefix} suffix={stat.suffix} value={stat.value} />
                    </dd>
                    <dt className="mt-1 text-sm text-muted-foreground">{stat.label}</dt>
                  </div>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* Body */}
      <div className="container mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div>
          <RichText className="max-w-none ms-0" data={project.body} enableGutter={false} />

          {project.gallery && project.gallery.length > 0 && (
            <section aria-label="Photo gallery" className="mt-12">
              <h2 className="text-h2 mb-6">Gallery</h2>
              <ul className="grid grid-cols-2 gap-4 list-none p-0 md:grid-cols-3">
                {project.gallery.map((item, index) => (
                  <Reveal as="li" delay={(index % 3) * 0.05} key={item.id ?? index}>
                    <figure className="overflow-hidden rounded-xl">
                      {item.image && typeof item.image === 'object' && (
                        <Media
                          imgClassName="aspect-4/3 w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                          resource={item.image}
                          size="(max-width: 768px) 50vw, 33vw"
                        />
                      )}
                      {item.caption && (
                        <figcaption className="py-2 text-sm text-muted-foreground">{item.caption}</figcaption>
                      )}
                    </figure>
                  </Reveal>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:pt-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold">Get involved</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Want to volunteer with this project or support it? We’d love to hear from you.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 font-medium text-brand-on transition-transform duration-150 hover:scale-[1.02]"
                href="/get-involved"
              >
                Volunteer
              </Link>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 font-medium transition-colors hover:border-foreground/40"
                href="/donate"
              >
                Donate
              </Link>
            </div>
          </div>

          {project.partners && project.partners.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-bold">Delivered with</h2>
              <ul className="mt-3 space-y-2 list-none p-0">
                {project.partners.map(
                  (partner) =>
                    typeof partner === 'object' && (
                      <li className="text-sm" key={partner.id}>
                        {partner.url ? (
                          <a className="underline hover:text-brand" href={partner.url} rel="noopener noreferrer" target="_blank">
                            {partner.name}
                          </a>
                        ) : (
                          partner.name
                        )}
                      </li>
                    ),
                )}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="container mt-20">
          <Weave className="mb-8 h-5 w-32 text-brand" />
          <h2 className="text-h2 mb-8">More of what we do</h2>
          <ul className="grid gap-6 list-none p-0 md:grid-cols-3">
            {related.map((relatedProject) => (
              <li key={relatedProject.id}>
                <Link
                  className="thread-top group block h-full overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
                  href={`/activities/${relatedProject.slug}`}
                >
                  {relatedProject.coverImage && typeof relatedProject.coverImage === 'object' && (
                    <Media
                      imgClassName="aspect-3/2 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      resource={relatedProject.coverImage}
                      size="(max-width: 768px) 100vw, 33vw"
                    />
                  )}
                  <div className="p-5">
                    <h3 className="text-h3 group-hover:underline">{relatedProject.title}</h3>
                    <p className="mt-2 line-clamp-2 text-muted-foreground">{relatedProject.summary}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const project = await queryProjectBySlug({ slug: decodeURIComponent(slug) })
  return generateMeta({ doc: project })
}

const queryProjectBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'projects',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  return result.docs?.[0] || null
})

const queryRelated = cache(
  async ({ categoryIds, excludeId }: { categoryIds: (number | string)[]; excludeId: number | string }) => {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'projects',
      depth: 1,
      limit: 3,
      overrideAccess: false,
      where: {
        and: [
          { id: { not_equals: excludeId } },
          { _status: { equals: 'published' } },
          ...(categoryIds.length > 0 ? [{ categories: { in: categoryIds } }] : []),
        ],
      },
    })
    return result.docs
  },
)
