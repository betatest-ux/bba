import type { GlobalAfterChangeHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Settings globals feed every page (theme, announcement bar, custom code,
 * navigation), so a change revalidates the whole route tree. Settings edits
 * are rare; correctness beats cache thrift here.
 */
export const makeRevalidateGlobal =
  (slug: string): GlobalAfterChangeHook =>
  ({ doc, req: { context, payload } }) => {
    if (!context.disableRevalidate) {
      payload.logger.info(`Revalidating global: ${slug}`)
      revalidateTag(`global_${slug}`, 'max')
      revalidatePath('/', 'layout')
    }
    return doc
  }
