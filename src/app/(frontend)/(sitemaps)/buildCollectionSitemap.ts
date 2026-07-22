import { getPayload, type CollectionSlug, type Where } from 'payload'
import config from '@payload-config'

/**
 * Shared builder for per-collection sitemaps: published docs only, mapped to
 * their public path prefix (see src/utilities/collectionPaths.ts).
 */
export const buildCollectionSitemap = async (options: {
  collection: CollectionSlug
  pathPrefix: string
  where?: Where
}): Promise<{ lastmod: string; loc: string }[]> => {
  const payload = await getPayload({ config })
  const SITE_URL =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    'https://bballiance.org.uk'

  const results = await payload.find({
    collection: options.collection,
    depth: 0,
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true, updatedAt: true },
    where: options.where ?? { _status: { equals: 'published' } },
  })

  const dateFallback = new Date().toISOString()

  return results.docs
    .filter((doc) => Boolean((doc as { slug?: string | null })?.slug))
    .map((doc) => ({
      lastmod: (doc as { updatedAt?: string }).updatedAt || dateFallback,
      loc: `${SITE_URL}${options.pathPrefix}/${(doc as { slug?: string }).slug}`,
    }))
}
