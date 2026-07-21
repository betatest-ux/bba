import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { slugField } from 'payload'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
} from '@payloadcms/plugin-seo/fields'

import { isAdminOrEditor, isStaff, isStaffOrPublished } from '@/access/roles'
import { restrictPublish } from '@/hooks/restrictPublish'
import { buildRevalidateHooks } from '@/hooks/revalidateCollection'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'

const { revalidateChange, revalidateDelete } = buildRevalidateHooks({
  pathPrefix: '/events',
  tag: 'events-sitemap',
})

export const Events: CollectionConfig<'events'> = {
  slug: 'events',
  access: {
    create: isStaff,
    delete: isAdminOrEditor,
    read: isStaffOrPublished,
    update: isStaff,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    startDate: true,
    endDate: true,
    venue: true,
    coverImage: true,
    summary: true,
  },
  admin: {
    defaultColumns: ['title', 'startDate', 'venue', '_status'],
    description: 'Events shown at /events. Past events move to the archive automatically.',
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
    {
      name: 'summary',
      type: 'textarea',
      admin: { description: 'One or two sentences for listings.' },
      localized: true,
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      localized: true,
      required: true,
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'startDate',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        position: 'sidebar',
      },
      required: true,
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        position: 'sidebar',
      },
    },
    {
      name: 'venue',
      type: 'text',
      admin: { position: 'sidebar' },
      localized: true,
      required: true,
    },
    {
      name: 'bookingLink',
      type: 'text',
      admin: {
        description: 'Optional link to Eventbrite, a form, etc.',
        position: 'sidebar',
      },
    },
    {
      name: 'recurrenceNote',
      type: 'text',
      admin: {
        description: 'e.g. “Every Tuesday during term time”.',
        position: 'sidebar',
      },
      localized: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar' },
    },
    {
      name: 'meta',
      type: 'group',
      label: 'SEO',
      fields: [
        OverviewField({
          titlePath: 'meta.title',
          descriptionPath: 'meta.description',
          imagePath: 'meta.image',
        }),
        MetaTitleField({ hasGenerateFn: true }),
        MetaImageField({ relationTo: 'media' }),
        MetaDescriptionField({}),
      ],
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateChange],
    afterDelete: [revalidateDelete],
    beforeChange: [populatePublishedAt, restrictPublish],
  },
  versions: {
    drafts: {
      autosave: { interval: 100 },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
