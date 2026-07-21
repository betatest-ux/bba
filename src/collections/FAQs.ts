import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { isAdminOrEditor, isStaff, publicRead } from '@/access/roles'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  labels: {
    singular: 'FAQ',
    plural: 'FAQs',
  },
  access: {
    create: isStaff,
    delete: isAdminOrEditor,
    read: publicRead,
    update: isStaff,
  },
  admin: {
    defaultColumns: ['question', 'category'],
    description: 'Questions and answers for the FAQs page and accordion blocks.',
    group: 'Content',
    useAsTitle: 'question',
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'answer',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      localized: true,
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      defaultValue: 'general',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Volunteering', value: 'volunteering' },
        { label: 'Donations', value: 'donations' },
        { label: 'Projects', value: 'projects' },
        { label: 'Jobs', value: 'jobs' },
      ],
      required: true,
    },
    {
      name: 'displayOrder',
      type: 'number',
      admin: { position: 'sidebar' },
      defaultValue: 99,
    },
  ],
  defaultSort: 'displayOrder',
  versions: true,
}
