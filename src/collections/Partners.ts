import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, isStaff, publicRead } from '@/access/roles'

export const Partners: CollectionConfig = {
  slug: 'partners',
  access: {
    create: isStaff,
    delete: isAdminOrEditor,
    read: publicRead,
    update: isStaff,
  },
  admin: {
    defaultColumns: ['name', 'partnerType', 'url'],
    description: 'Funders, partners and sponsors. Powers the logo strips.',
    group: 'Content',
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      admin: { description: 'The organisation’s website, including https://' },
    },
    {
      name: 'partnerType',
      type: 'select',
      defaultValue: 'partner',
      label: 'Type',
      options: [
        { label: 'Funder', value: 'funder' },
        { label: 'Partner', value: 'partner' },
        { label: 'Sponsor', value: 'sponsor' },
      ],
      required: true,
    },
  ],
  versions: true,
}
