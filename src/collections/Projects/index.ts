import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { slugField } from 'payload'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

import { isAdminOrEditor, isStaff, isStaffOrPublished } from '@/access/roles'
import { Banner } from '@/blocks/Banner/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { restrictPublish } from '@/hooks/restrictPublish'
import { buildRevalidateHooks } from '@/hooks/revalidateCollection'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'

const { revalidateChange, revalidateDelete } = buildRevalidateHooks({
  pathPrefix: '/activities',
  tag: 'projects-sitemap',
})

export const Projects: CollectionConfig<'projects'> = {
  slug: 'projects',
  labels: {
    singular: 'Project',
    plural: 'Projects (Activities)',
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
    summary: true,
    categories: true,
    status: true,
    coverImage: true,
    location: true,
  },
  admin: {
    defaultColumns: ['title', 'status', 'categories', 'updatedAt'],
    description: 'The charity’s projects and activities, shown at /activities.',
    group: 'Content',
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({ slug: data?.slug, collection: 'projects', req }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({ slug: data?.slug as string, collection: 'projects', req }),
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
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'summary',
              type: 'textarea',
              admin: {
                description: 'One or two sentences shown on cards and listings.',
              },
              localized: true,
              required: true,
            },
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'body',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                  BlocksFeature({ blocks: [Banner, MediaBlock] }),
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                  HorizontalRuleFeature(),
                ],
              }),
              localized: true,
              required: true,
            },
            {
              name: 'gallery',
              type: 'array',
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'caption',
                  type: 'text',
                  localized: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Details',
          fields: [
            {
              name: 'impactStats',
              type: 'array',
              admin: {
                description: 'Key numbers for this project, e.g. 120 “families supported”.',
              },
              fields: [
                { name: 'value', type: 'number', required: true },
                { name: 'prefix', type: 'text' },
                { name: 'suffix', type: 'text' },
                { name: 'label', type: 'text', localized: true, required: true },
              ],
              maxRows: 4,
            },
            {
              name: 'partners',
              type: 'relationship',
              hasMany: true,
              relationTo: 'partners',
            },
            {
              name: 'startDate',
              type: 'date',
            },
            {
              name: 'endDate',
              type: 'date',
            },
          ],
        },
        {
          name: 'meta',
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
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: { position: 'sidebar' },
      hasMany: true,
      relationTo: 'project-categories',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      admin: { position: 'sidebar' },
      defaultValue: 'ongoing',
      // Without this, Postgres would name this enum "enum_projects_status" —
      // the same name Payload generates for the drafts _status enum — and the
      // collision breaks migrations with "invalid input value for enum".
      enumName: 'enum_projects_activity_status',
      options: [
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Upcoming', value: 'upcoming' },
      ],
      required: true,
    },
    {
      name: 'location',
      type: 'text',
      admin: {
        description: 'e.g. “Bastwell, Blackburn” or “Sylhet, Bangladesh”.',
        position: 'sidebar',
      },
      localized: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar' },
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
