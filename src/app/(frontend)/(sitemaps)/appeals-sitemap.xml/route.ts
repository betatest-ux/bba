import { getServerSideSitemap } from 'next-sitemap'
import { unstable_cache } from 'next/cache'

import { buildCollectionSitemap } from '../buildCollectionSitemap'

const getSitemap = unstable_cache(
  async () => buildCollectionSitemap({ collection: 'appeals', pathPrefix: '/appeals' }),
  ['appeals-sitemap'],
  { tags: ['appeals-sitemap'] },
)

export async function GET() {
  return getServerSideSitemap(await getSitemap())
}
