import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, isStaff, publicRead } from '@/access/roles'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  access: {
    create: isStaff,
    delete: isAdminOrEditor,
    read: publicRead,
    update: isStaff,
  },
  admin: {
    defaultColumns: ['quote', 'name', 'context'],
    description: 'Short quotes from people the charity has helped or worked with.',
    group: 'Content',
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      localized: true,
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      admin: { description: 'First name only is fine, e.g. “Amina”.' },
      required: true,
    },
    {
      name: 'context',
      type: 'text',
      admin: { description: 'e.g. “Parent, Little Harwood youth club”.' },
      localized: true,
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
  ],
  versions: true,
}
