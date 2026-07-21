import type { GlobalConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { isAdmin } from '@/access/roles'
import { makeRevalidateGlobal } from './revalidateGlobal'

export const CookieSettings: GlobalConfig = {
  slug: 'cookie-settings',
  label: 'Cookie & Consent',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    description: 'The cookie banner’s wording and categories.',
    group: 'Settings',
  },
  fields: [
    {
      name: 'bannerHeading',
      type: 'text',
      defaultValue: 'Cookies on this site',
      localized: true,
      required: true,
    },
    {
      name: 'bannerText',
      type: 'richText',
      editor: lexicalEditor({
        features: () => [FixedToolbarFeature(), InlineToolbarFeature()],
      }),
      localized: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'acceptLabel',
          type: 'text',
          admin: { width: '33%' },
          defaultValue: 'Accept all',
          localized: true,
        },
        {
          name: 'rejectLabel',
          type: 'text',
          admin: { width: '33%' },
          defaultValue: 'Essential only',
          localized: true,
        },
      ],
    },
    {
      name: 'categories',
      type: 'array',
      admin: {
        description: 'Cookie categories listed in the banner. “Essential” is always on.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'key', type: 'text', admin: { width: '30%' }, required: true },
            { name: 'label', type: 'text', admin: { width: '30%' }, localized: true, required: true },
            {
              name: 'alwaysOn',
              type: 'checkbox',
              admin: { width: '20%' },
              label: 'Always on',
            },
          ],
        },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
  ],
  hooks: {
    afterChange: [makeRevalidateGlobal('cookie-settings')],
  },
}
