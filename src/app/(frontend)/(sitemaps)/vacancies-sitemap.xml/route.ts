import { getServerSideSitemap } from 'next-sitemap'
import { unstable_cache } from 'next/cache'

import { buildCollectionSitemap } from '../buildCollectionSitemap'

const getSitemap = unstable_cache(
  async () =>
    buildCollectionSitemap({
      collection: 'vacancies',
      pathPrefix: '/jobs',
      // Only open roles belong in the sitemap.
      where: {
        and: [
          { _status: { equals: 'published' } },
          { closingDate: { greater_than: new Date().toISOString() } },
        ],
      },
    }),
  ['vacancies-sitemap'],
  { tags: ['vacancies-sitemap'] },
)

export async function GET() {
  return getServerSideSitemap(await getSitemap())
}
