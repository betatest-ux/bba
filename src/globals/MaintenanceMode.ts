import type { GlobalConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { isAdmin } from '@/access/roles'
import { makeRevalidateGlobal } from './revalidateGlobal'

export const MaintenanceMode: GlobalConfig = {
  slug: 'maintenance-mode',
  label: 'Maintenance Mode',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    description:
      'Puts the public site behind a “back soon” page. Signed-in admins and editors still see the full site, and /admin keeps working.',
    group: 'Settings',
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: false,
      label: '🚧 Maintenance mode on',
    },
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'We’ll be back soon',
      localized: true,
    },
    {
      name: 'message',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      localized: true,
    },
  ],
  hooks: {
    afterChange: [makeRevalidateGlobal('maintenance-mode')],
  },
}
