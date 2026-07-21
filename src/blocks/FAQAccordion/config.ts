import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const FAQAccordion: Block = {
  slug: 'faqAccordion',
  interfaceName: 'FAQAccordionBlock',
  labels: {
    singular: 'FAQ Accordion',
    plural: 'FAQ Accordions',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
    },
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'category',
      options: [
        { label: 'A whole FAQ category', value: 'category' },
        { label: 'Hand-picked FAQs', value: 'selection' },
        { label: 'Written here (one-off)', value: 'manual' },
      ],
    },
    {
      name: 'category',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'category',
      },
      options: [
        { label: 'General', value: 'general' },
        { label: 'Volunteering', value: 'volunteering' },
        { label: 'Donations', value: 'donations' },
        { label: 'Projects', value: 'projects' },
        { label: 'Jobs', value: 'jobs' },
      ],
    },
    {
      name: 'faqs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      relationTo: 'faqs',
    },
    {
      name: 'items',
      type: 'array',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'manual',
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
      ],
    },
  ],
}
