import type { Metadata } from 'next'

import { RelatedNews } from '@/blocks/RelatedNews/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import { NewsHero } from '@/heros/NewsHero'
import { ShareLinks } from '@/components/ShareLinks'
import { generateMeta } from '@/utilities/generateMeta'
import { getServerSideURL } from '@/utilities/getURL'
import { readingTime } from '@/utilities/readingTime'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const articles = await payload.find({
    collection: 'news',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = articles.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function NewsArticle({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/news/' + decodedSlug
  const article = await queryNewsBySlug({ slug: decodedSlug })

  if (!article) return <PayloadRedirects url={url} />

  const absoluteUrl = `${getServerSideURL()}${url}`
  const minutes = readingTime(article.content)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
    dateModified: article.updatedAt,
    ...(Array.isArray(article.authors) && article.authors.length > 0
      ? {
          author: article.authors
            .filter((author) => typeof author === 'object' && author !== null)
            .map((author) => ({ '@type': 'Person', name: (author as { name: string }).name })),
        }
      : {}),
    ...(article.heroImage && typeof article.heroImage === 'object' && article.heroImage.url
      ? { image: `${getServerSideURL()}${article.heroImage.url}` }
      : {}),
    mainEntityOfPage: absoluteUrl,
    publisher: { '@type': 'Organization', name: 'BBAlliance' },
  }

  return (
    <article className="pt-0 pb-16">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        type="application/ld+json"
      />

      <NewsHero article={article} />

      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container">
          <p className="mx-auto max-w-[48rem] text-sm text-muted-foreground">
            {minutes} min read
          </p>
          <RichText
            className="max-w-[48rem] mx-auto mt-4"
            data={article.content}
            enableGutter={false}
          />
          <div className="mx-auto mt-10 max-w-[48rem]">
            <ShareLinks title={article.title} url={absoluteUrl} />
          </div>
          {article.relatedNews && article.relatedNews.length > 0 && (
            <RelatedNews
              className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              docs={article.relatedNews.filter((item) => typeof item === 'object')}
            />
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const article = await queryNewsBySlug({ slug: decodedSlug })

  return generateMeta({ doc: article })
}

const queryNewsBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'news',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
