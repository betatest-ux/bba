import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

type DocWithSlug = { _status?: string | null; id: number | string; slug?: string | null }

/**
 * Builds on-demand ISR revalidation hooks for a collection whose documents
 * live at `${pathPrefix}/${slug}`. Also busts the listing page and sitemap.
 */
export const buildRevalidateHooks = <T extends DocWithSlug>(options: {
  pathPrefix: string
  tag: string
}): {
  revalidateChange: CollectionAfterChangeHook<T>
  revalidateDelete: CollectionAfterDeleteHook<T>
} => {
  const { pathPrefix, tag } = options

  const revalidateChange: CollectionAfterChangeHook<T> = ({
    doc,
    previousDoc,
    req: { context, payload },
  }) => {
    if (context.disableRevalidate) return doc

    if (doc._status === 'published') {
      const path = `${pathPrefix}/${doc.slug}`
      payload.logger.info(`Revalidating ${path}`)
      revalidatePath(path)
      revalidatePath(pathPrefix)
      revalidateTag(tag, 'max')
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = `${pathPrefix}/${previousDoc.slug}`
      payload.logger.info(`Revalidating old ${oldPath}`)
      revalidatePath(oldPath)
      revalidatePath(pathPrefix)
      revalidateTag(tag, 'max')
    }

    return doc
  }

  const revalidateDelete: CollectionAfterDeleteHook<T> = ({ doc, req: { context } }) => {
    if (context.disableRevalidate) return doc
    revalidatePath(`${pathPrefix}/${doc?.slug}`)
    revalidatePath(pathPrefix)
    revalidateTag(tag, 'max')
    return doc
  }

  return { revalidateChange, revalidateDelete }
}
