import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { isAdminOrEditor, isStaff, publicRead } from '@/access/roles'
import { revalidatePath } from 'next/cache'

export const People: CollectionConfig = {
  slug: 'people',
  labels: {
    singular: 'Person',
    plural: 'People',
  },
  access: {
    create: isStaff,
    delete: isAdminOrEditor,
    read: publicRead,
    update: isStaff,
  },
  admin: {
    defaultColumns: ['name', 'role', 'personType', 'displayOrder'],
    description: 'Trustees, staff and volunteers shown on the Trustees & Staff page.',
    group: 'Content',
    useAsTitle: 'name',
  },
  defaultSort: 'displayOrder',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      admin: { description: 'e.g. “Chair of Trustees” or “Youth Worker”.' },
      localized: true,
      required: true,
    },
    {
      name: 'personType',
      type: 'select',
      defaultValue: 'staff',
      label: 'Type',
      options: [
        { label: 'Trustee', value: 'trustee' },
        { label: 'Staff', value: 'staff' },
        { label: 'Volunteer', value: 'volunteer' },
      ],
      required: true,
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'bio',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      localized: true,
    },
    {
      name: 'email',
      type: 'email',
      admin: { description: 'Optional. Shown publicly if filled in.' },
    },
    {
      name: 'displayOrder',
      type: 'number',
      admin: {
        description: 'Lower numbers appear first within their group.',
        position: 'sidebar',
      },
      defaultValue: 99,
    },
  ],
  hooks: {
    afterChange: [
      ({ doc, req: { context } }) => {
        if (!context.disableRevalidate) revalidatePath('/trustees-and-staff')
        return doc
      },
    ],
    afterDelete: [
      ({ doc, req: { context } }) => {
        if (!context.disableRevalidate) revalidatePath('/trustees-and-staff')
        return doc
      },
    ],
  },
  versions: true,
}
