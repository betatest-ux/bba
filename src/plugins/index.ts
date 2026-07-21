import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { isAdminOrEditor } from '@/access/roles'
import { Page, Project, News as NewsType } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<NewsType | Page | Project> = ({ doc }) => {
  return doc?.title ? `${doc.title} | BBAlliance` : 'BBAlliance'
}

const generateURL: GenerateURL<NewsType | Page | Project> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'news', 'projects', 'events', 'appeals', 'vacancies'],
    overrides: {
      access: {
        create: isAdminOrEditor,
        delete: isAdminOrEditor,
        update: isAdminOrEditor,
      },
      admin: {
        description:
          'Send an old address to a new one — essential when a page is renamed so saved links and Google results keep working.',
        group: 'Admin',
      },
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description:
                  'The old path, starting with a slash — e.g. /old-page-name. Takes effect within a few minutes.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      admin: {
        group: 'Content',
      },
      access: {
        create: isAdminOrEditor,
        delete: isAdminOrEditor,
        update: isAdminOrEditor,
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
    formSubmissionOverrides: {
      admin: {
        defaultColumns: ['form', 'isRead', 'createdAt'],
        group: 'Inbox',
      },
      access: {
        read: isAdminOrEditor,
        update: isAdminOrEditor,
      },
      fields: ({ defaultFields }) => {
        return [
          ...defaultFields,
          {
            name: 'isRead',
            type: 'checkbox',
            admin: {
              description: 'Tick once this submission has been dealt with.',
              position: 'sidebar',
            },
            defaultValue: false,
            label: 'Read',
          },
        ]
      },
    },
  }),
  searchPlugin({
    collections: ['news', 'projects', 'events', 'pages', 'faqs'],
    beforeSync: beforeSyncWithSearch,
    defaultPriorities: {
      events: 30,
      faqs: 20,
      news: 40,
      pages: 50,
      projects: 50,
    },
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]
