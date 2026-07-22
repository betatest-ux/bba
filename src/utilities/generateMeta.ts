import type { Metadata } from 'next'

import type { Media, News, Page, Project, Config } from '../payload-types'

import { getCachedGlobal } from './getGlobals'
import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url: string | null = null

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

/**
 * Per-document metadata driven by the SEO plugin fields, falling back to the
 * admin-editable defaults in Settings → SEO Defaults (title template, default
 * description and share image, site-wide noindex switch).
 */
export const generateMeta = async (args: {
  doc: Partial<News> | Partial<Page> | Partial<Project> | null
}): Promise<Metadata> => {
  const { doc } = args

  const seoSettings = await getCachedGlobal('seo-settings', 1)().catch(() => null)

  const template = seoSettings?.titleTemplate || '%s | BBAlliance'
  const siteTitle = template.replace('%s', '').replace(/^[\s|–—-]+|[\s|–—-]+$/g, '') || 'BBAlliance'

  const rawTitle = doc?.meta?.title || doc?.title
  const title = rawTitle ? template.replace('%s', rawTitle) : siteTitle

  const description =
    doc?.meta?.description || seoSettings?.defaultDescription || undefined

  const ogImage =
    getImageURL(doc?.meta?.image) ??
    getImageURL(
      typeof seoSettings?.defaultOGImage === 'object' ? seoSettings?.defaultOGImage : null,
    )

  return {
    description,
    openGraph: mergeOpenGraph({
      description: description || '',
      images: ogImage ? [{ url: ogImage }] : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    robots:
      seoSettings?.allowIndexing === false
        ? { follow: false, index: false }
        : undefined,
    title,
  }
}
