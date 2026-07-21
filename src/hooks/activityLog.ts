import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  GlobalAfterChangeHook,
  GlobalConfig,
  PayloadRequest,
} from 'payload'

/**
 * Lightweight audit trail: every create/update/delete on content, and every
 * settings change, is written to the `activity-log` collection (admins only).
 */
const write = async (
  req: PayloadRequest,
  entry: {
    action: 'created' | 'updated' | 'deleted'
    collectionSlug?: string
    documentId?: string
    globalSlug?: string
    title?: string
  },
): Promise<void> => {
  try {
    await req.payload.create({
      collection: 'activity-log',
      data: {
        action: entry.action,
        collectionSlug: entry.collectionSlug ?? null,
        documentId: entry.documentId ? String(entry.documentId) : null,
        globalSlug: entry.globalSlug ?? null,
        title: entry.title ?? null,
        user: req.user?.id ?? null,
        userEmail: req.user?.email ?? 'system',
      },
      req,
    })
  } catch (error) {
    req.payload.logger.error({ err: error, msg: 'Failed to write activity log entry' })
  }
}

const titleOf = (doc: Record<string, unknown> | undefined): string | undefined => {
  if (!doc) return undefined
  for (const key of ['title', 'name', 'question', 'email', 'quote']) {
    const value = doc[key]
    if (typeof value === 'string' && value.length > 0) return value.slice(0, 120)
  }
  return undefined
}

export const logCollectionChange: CollectionAfterChangeHook = async ({
  collection,
  doc,
  operation,
  req,
}) => {
  // Autosave fires constantly while typing — logging every keystroke would
  // drown the trail. Only log real saves.
  const isAutosave = req.query?.autosave === 'true'
  if (isAutosave) return doc

  await write(req, {
    action: operation === 'create' ? 'created' : 'updated',
    collectionSlug: collection.slug,
    documentId: String(doc.id),
    title: titleOf(doc),
  })
  return doc
}

export const logCollectionDelete: CollectionAfterDeleteHook = async ({ collection, doc, req }) => {
  await write(req, {
    action: 'deleted',
    collectionSlug: collection.slug,
    documentId: String(doc.id),
    title: titleOf(doc),
  })
  return doc
}

export const logGlobalChange: GlobalAfterChangeHook = async ({ doc, global, req }) => {
  await write(req, {
    action: 'updated',
    globalSlug: global.slug,
    title: global.label ? String(global.label) : global.slug,
  })
  return doc
}

/** Wraps a collection config so all changes land in the activity log. */
export const withActivityLog = (collection: CollectionConfig): CollectionConfig => ({
  ...collection,
  hooks: {
    ...collection.hooks,
    afterChange: [...(collection.hooks?.afterChange ?? []), logCollectionChange],
    afterDelete: [...(collection.hooks?.afterDelete ?? []), logCollectionDelete],
  },
})

/** Wraps a global config so all changes land in the activity log. */
export const withGlobalActivityLog = (global: GlobalConfig): GlobalConfig => ({
  ...global,
  hooks: {
    ...global.hooks,
    afterChange: [...(global.hooks?.afterChange ?? []), logGlobalChange],
  },
})
