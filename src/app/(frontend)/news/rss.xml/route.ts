import configPromise from '@payload-config'
import escapeHTML from 'escape-html'
import { getPayload } from 'payload'

import { lexicalToPlainText } from '@/utilities/lexicalToPlainText'
import { getServerSideURL } from '@/utilities/getURL'

export const revalidate = 600

export async function GET(): Promise<Response> {
  const payload = await getPayload({ config: configPromise })
  const SITE_URL = getServerSideURL()

  const articles = await payload.find({
    collection: 'news',
    depth: 0,
    limit: 50,
    overrideAccess: false,
    sort: '-publishedAt',
    where: { _status: { equals: 'published' } },
  })

  const items = articles.docs
    .map((article) => {
      const link = `${SITE_URL}/news/${article.slug}`
      const description =
        article.meta?.description || lexicalToPlainText(article.content).slice(0, 200)
      const pubDate = article.publishedAt
        ? new Date(article.publishedAt).toUTCString()
        : new Date(article.createdAt).toUTCString()

      return `    <item>
      <title>${escapeHTML(article.title)}</title>
      <link>${escapeHTML(link)}</link>
      <guid isPermaLink="true">${escapeHTML(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeHTML(description)}</description>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>BBAlliance News</title>
    <link>${escapeHTML(`${SITE_URL}/news`)}</link>
    <description>News and stories from BBAlliance, a community charity in Blackburn and Darwen.</description>
    <language>en-gb</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Cache-Control': 's-maxage=600, stale-while-revalidate',
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
