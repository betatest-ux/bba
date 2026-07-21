import type { CollectionConfig } from 'payload'

import { slugField } from 'payload'

import { isAdminOrEditor, publicRead } from '@/access/roles'

export const ProjectCategories: CollectionConfig = {
  slug: 'project-categories',
  labels: {
    singular: 'Project Category',
    plural: 'Project Categories',
  },
  access: {
    create: isAdminOrEditor,
    delete: isAdminOrEditor,
    read: publicRead,
    update: isAdminOrEditor,
  },
  admin: {
    description: 'Categories for projects, e.g. Youth, Food Support. Used by the Activities filters.',
    group: 'Content',
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    slugField(),
  ],
}
