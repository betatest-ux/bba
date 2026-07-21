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
  pathPrefix: '/jobs',
  tag: 'vacancies-sitemap',
})

export const Vacancies: CollectionConfig<'vacancies'> = {
  slug: 'vacancies',
  labels: {
    singular: 'Vacancy',
    plural: 'Vacancies',
  },
  access: {
    create: isStaff,
    delete: isAdminOrEditor,
    read: isStaffOrPublished,
    update: isStaff,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    vacancyType: true,
    location: true,
    hours: true,
    salary: true,
    closingDate: true,
  },
  admin: {
    defaultColumns: ['title', 'vacancyType', 'closingDate', '_status'],
    description:
      'Paid roles and volunteer roles. Roles disappear from the public site automatically after their closing date but stay here.',
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
      name: 'vacancyType',
      type: 'select',
      admin: { position: 'sidebar' },
      defaultValue: 'voluntary',
      label: 'Role type',
      options: [
        { label: 'Paid', value: 'paid' },
        { label: 'Voluntary', value: 'voluntary' },
      ],
      required: true,
    },
    {
      name: 'location',
      type: 'text',
      admin: { position: 'sidebar' },
      localized: true,
      required: true,
    },
    {
      name: 'hours',
      type: 'text',
      admin: {
        description: 'e.g. “21 hours / week” or “Flexible — 2 hours a week”.',
        position: 'sidebar',
      },
      localized: true,
    },
    {
      name: 'salary',
      type: 'text',
      admin: {
        description: 'e.g. “£24,000 pro rata” — or leave blank for voluntary roles.',
        position: 'sidebar',
      },
    },
    {
      name: 'closingDate',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'After this date the role no longer shows on the website.',
        position: 'sidebar',
      },
      required: true,
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
