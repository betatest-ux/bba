import type { GlobalConfig } from 'payload'

import { isAdmin } from '@/access/roles'
import { makeRevalidateGlobal } from './revalidateGlobal'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Identity',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    description: 'The charity’s name, logo and registered details, used across the whole site.',
    group: 'Settings',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'BBAlliance',
      required: true,
    },
    {
      name: 'strapline',
      type: 'text',
      admin: { description: 'A short line under the name, e.g. “Stronger together in Blackburn and Darwen”.' },
      localized: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'logoLight',
          type: 'upload',
          admin: { description: 'Logo used on light backgrounds.', width: '50%' },
          relationTo: 'media',
        },
        {
          name: 'logoDark',
          type: 'upload',
          admin: { description: 'Logo used on dark backgrounds.', width: '50%' },
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'favicon',
      type: 'upload',
      admin: { description: 'Small square icon for browser tabs. PNG or SVG, at least 96×96.' },
      relationTo: 'media',
    },
    {
      name: 'charityNumber',
      type: 'text',
      admin: { description: 'Shown in the footer and on legal pages.' },
      defaultValue: 'Registered Charity No. [PENDING]',
      required: true,
    },
    {
      name: 'registeredAddress',
      type: 'textarea',
      defaultValue: '[PLACEHOLDER — replace] 1 Example Street, Blackburn, BB1 1AA',
    },
    {
      name: 'organisationLine',
      type: 'text',
      admin: {
        description: 'Company/CIO details line for the footer, e.g. “BBAlliance is a Charitable Incorporated Organisation”.',
      },
      localized: true,
    },
  ],
  hooks: {
    afterChange: [makeRevalidateGlobal('site-settings')],
  },
}
