import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'

export const beforeSyncWithSearch: BeforeSync = async ({ req, originalDoc, searchDoc }) => {
  const {
    doc: { relationTo: collection },
  } = searchDoc

  const { slug, id, categories, title, question, meta } = originalDoc

  const modifiedDoc: DocToSync = {
    ...searchDoc,
    slug: slug ?? null,
    title: title || question || searchDoc.title,
    meta: {
      ...meta,
      title: meta?.title || title || question,
      image: meta?.image?.id || meta?.image,
      description: meta?.description || originalDoc.summary || null,
    },
    categories: [],
  }

  if (categories && Array.isArray(categories) && categories.length > 0) {
    // News relates to `categories`; projects relate to `project-categories`.
    const categoriesCollection = collection === 'projects' ? 'project-categories' : 'categories'
    const populatedCategories: { id: string | number; title: string }[] = []

    for (const category of categories) {
      if (!category) {
        continue
      }

      if (typeof category === 'object') {
        populatedCategories.push(category)
        continue
      }

      const doc = await req.payload.findByID({
        collection: categoriesCollection,
        id: category,
        disableErrors: true,
        depth: 0,
        select: { title: true },
        req,
      })

      if (doc !== null) {
        populatedCategories.push(doc)
      } else {
        console.error(
          `Failed. Category not found when syncing collection '${collection}' with id: '${id}' to search.`,
        )
      }
    }

    modifiedDoc.categories = populatedCategories.map((each) => ({
      relationTo: categoriesCollection,
      categoryID: String(each.id),
      title: each.title,
    }))
  }

  return modifiedDoc
}
