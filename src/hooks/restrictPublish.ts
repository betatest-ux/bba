import type { CollectionBeforeChangeHook } from 'payload'
import { Forbidden } from 'payload'

import { hasRole } from '@/access/roles'
import type { User } from '@/payload-types'

/**
 * Contributors may create and edit drafts, but only editors and admins can
 * publish (or edit an already-published document, which would amount to
 * publishing new content).
 */
export const restrictPublish: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
  const user = req.user as User | null

  // Internal server-side operations (seed scripts, hooks) pass no user.
  if (!user) return data
  if (hasRole(user, 'admin', 'editor')) return data

  const wantsPublish = data?._status === 'published'
  const alreadyPublished = originalDoc?._status === 'published'

  if (wantsPublish || alreadyPublished) {
    throw new Forbidden(() => 'Contributors can save drafts, but only editors and admins can publish.')
  }

  return data
}
