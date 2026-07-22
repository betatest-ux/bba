const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://bballiance.org.uk'

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: [
    '/pages-sitemap.xml',
    '/news-sitemap.xml',
    '/projects-sitemap.xml',
    '/events-sitemap.xml',
    '/appeals-sitemap.xml',
    '/vacancies-sitemap.xml',
    '/*',
    '/news/*',
    '/activities/*',
    '/events/*',
    '/appeals/*',
    '/jobs/*',
    '/newsletter/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: ['/admin', '/api', '/newsletter/confirm', '/newsletter/unsubscribe'],
      },
    ],
    additionalSitemaps: [
      `${SITE_URL}/pages-sitemap.xml`,
      `${SITE_URL}/news-sitemap.xml`,
      `${SITE_URL}/projects-sitemap.xml`,
      `${SITE_URL}/events-sitemap.xml`,
      `${SITE_URL}/appeals-sitemap.xml`,
      `${SITE_URL}/vacancies-sitemap.xml`,
    ],
  },
}
