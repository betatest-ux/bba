/**
 * Maps collection slugs to their public URL prefixes. The projects collection
 * deliberately lives at /activities (friendlier for visitors), so never build
 * URLs from collection slugs directly — use this map.
 */
export const collectionPathMap: Record<string, string> = {
  appeals: '/appeals',
  events: '/events',
  news: '/news',
  pages: '',
  projects: '/activities',
  vacancies: '/jobs',
}

export const getCollectionPath = (collection: string, slug?: string | null): string => {
  const prefix = collectionPathMap[collection] ?? `/${collection}`
  const safeSlug = slug && slug !== 'home' ? `/${slug}` : ''
  return `${prefix}${safeSlug}` || '/'
}
