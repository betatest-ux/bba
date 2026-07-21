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
  pathPrefix: '/appeals',
  tag: 'appeals-sitemap',
})

export const Appeals: CollectionConfig<'appeals'> = {
  slug: 'appeals',
  access: {
    create: isStaff,
    delete: isAdminOrEditor,
    read: isStaffOrPublished,
    update: isStaff,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    summary: true,
    targetAmount: true,
    raisedAmount: true,
    endDate: true,
    donateUrl: true,
    coverImage: true,
  },
  admin: {
    defaultColumns: ['title', 'targetAmount', 'raisedAmount', 'endDate', '_status'],
    description:
      'Fundraising campaigns. Update “Amount raised” as donations come in — the progress bar updates everywhere automatically.',
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
      admin: { description: 'One or two sentences for cards and the homepage spotlight.' },
      localized: true,
      required: true,
    },
    {
      name: 'story',
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
      name: 'targetAmount',
      type: 'number',
      admin: {
        description: 'Target in pounds, digits only — e.g. 15000',
        position: 'sidebar',
      },
      min: 1,
      required: true,
    },
    {
      name: 'raisedAmount',
      type: 'number',
      admin: {
        description: 'Raised so far in pounds. Update this by hand as donations arrive.',
        position: 'sidebar',
      },
      defaultValue: 0,
      min: 0,
      required: true,
    },
    {
      name: 'endDate',
      type: 'date',
      admin: { position: 'sidebar' },
    },
    {
      name: 'donateUrl',
      type: 'text',
      admin: {
        description:
          'Optional. Overrides the site-wide donation link (Settings → Donation Settings) for this appeal only.',
        position: 'sidebar',
      },
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
