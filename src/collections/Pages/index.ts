import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, isStaff, isStaffOrPublished } from '@/access/roles'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { AppealProgress } from '../../blocks/AppealProgress/config'
import { EventsStrip } from '../../blocks/EventsStrip/config'
import { FAQAccordion } from '../../blocks/FAQAccordion/config'
import { FeaturedProjects } from '../../blocks/FeaturedProjects/config'
import { Gallery } from '../../blocks/Gallery/config'
import { ImageTextSplit } from '../../blocks/ImageTextSplit/config'
import { MapBlock } from '../../blocks/MapBlock/config'
import { PartnerLogos } from '../../blocks/PartnerLogos/config'
import { StatRow } from '../../blocks/StatRow/config'
import { TestimonialsBlock } from '../../blocks/TestimonialsBlock/config'
import { Timeline } from '../../blocks/Timeline/config'
import { VideoEmbed } from '../../blocks/VideoEmbed/config'
import { hero } from '@/heros/config'
import { slugField } from 'payload'
import { restrictPublish } from '@/hooks/restrictPublish'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: isStaff,
    delete: isAdminOrEditor,
    read: isStaffOrPublished,
    update: isStaff,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
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
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                CallToAction,
                Content,
                MediaBlock,
                Archive,
                FormBlock,
                ImageTextSplit,
                StatRow,
                Gallery,
                VideoEmbed,
                FAQAccordion,
                Timeline,
                PartnerLogos,
                AppealProgress,
                MapBlock,
                TestimonialsBlock,
                EventsStrip,
                FeaturedProjects,
              ],
              required: true,
              admin: {
                initCollapsed: true,
              },
              localized: true,
            },
          ],
          label: 'Content',
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
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      admin: {
        description: 'Optional. Nesting a page under a parent adds breadcrumbs and a nested URL.',
        position: 'sidebar',
      },
      filterOptions: ({ id }) => ({ id: { not_equals: id } }),
      relationTo: 'pages',
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt, restrictPublish],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
