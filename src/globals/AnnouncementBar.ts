import type { GlobalConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { isAdminOrEditor } from '@/access/roles'
import { link } from '@/fields/link'
import { makeRevalidateGlobal } from './revalidateGlobal'

export const AnnouncementBar: GlobalConfig = {
  slug: 'announcement-bar',
  label: 'Announcement Bar',
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  admin: {
    description:
      'A dismissible banner across the top of every page — for appeals, closures or urgent news. Optionally schedule it with start and end dates.',
    group: 'Settings',
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show the announcement bar',
    },
    {
      name: 'message',
      type: 'richText',
      admin: {
        condition: (data) => Boolean(data?.enabled),
      },
      editor: lexicalEditor({
        features: () => [FixedToolbarFeature(), InlineToolbarFeature()],
      }),
      localized: true,
    },
    {
      name: 'enableLink',
      type: 'checkbox',
      admin: {
        condition: (data) => Boolean(data?.enabled),
      },
      label: 'Add a button/link',
    },
    link({
      appearances: false,
      overrides: {
        admin: {
          condition: (data) => Boolean(data?.enabled) && Boolean(data?.enableLink),
        },
      },
    }),
    {
      name: 'variant',
      type: 'select',
      admin: {
        condition: (data) => Boolean(data?.enabled),
      },
      defaultValue: 'info',
      options: [
        { label: 'Info (calm)', value: 'info' },
        { label: 'Urgent appeal', value: 'urgent' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startAt',
          type: 'date',
          admin: {
            condition: (data) => Boolean(data?.enabled),
            date: { pickerAppearance: 'dayAndTime' },
            description: 'Optional — the bar appears from this moment.',
            width: '50%',
          },
        },
        {
          name: 'endAt',
          type: 'date',
          admin: {
            condition: (data) => Boolean(data?.enabled),
            date: { pickerAppearance: 'dayAndTime' },
            description: 'Optional — the bar hides itself after this moment.',
            width: '50%',
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [makeRevalidateGlobal('announcement-bar')],
  },
}
