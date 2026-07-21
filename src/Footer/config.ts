import type { GlobalConfig } from 'payload'

import { isAdminOrEditor } from '@/access/roles'
import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer Menu',
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  admin: {
    description:
      'Footer link columns and legal links. Contact details and the charity number come from Site Identity and Contact Settings.',
    group: 'Settings',
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      admin: {
        description: 'Columns of quick links.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'links',
          type: 'array',
          fields: [
            link({
              appearances: false,
            }),
          ],
          maxRows: 8,
        },
      ],
      maxRows: 4,
    },
    {
      name: 'legalLinks',
      type: 'array',
      admin: {
        description: 'Small links along the bottom — privacy, cookies, accessibility…',
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 8,
    },
    {
      name: 'newsletterEnabled',
      type: 'checkbox',
      admin: {
        description: 'Show the newsletter sign-up in the footer.',
      },
      defaultValue: true,
      label: 'Show newsletter sign-up',
    },
    {
      name: 'newsletterHeading',
      type: 'text',
      admin: {
        condition: (data) => Boolean(data?.newsletterEnabled),
      },
      defaultValue: 'Stay in the loop',
      localized: true,
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
