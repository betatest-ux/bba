import type { GlobalConfig } from 'payload'

import { isAdmin } from '@/access/roles'
import { makeRevalidateGlobal } from './revalidateGlobal'

export const SEOSettings: GlobalConfig = {
  slug: 'seo-settings',
  label: 'SEO Defaults',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    description: 'Site-wide defaults for search engines and social sharing.',
    group: 'Settings',
  },
  fields: [
    {
      name: 'titleTemplate',
      type: 'text',
      admin: {
        description: '%s is replaced by the page title — e.g. “%s | BBAlliance”.',
      },
      defaultValue: '%s | BBAlliance',
      required: true,
    },
    {
      name: 'defaultDescription',
      type: 'textarea',
      defaultValue:
        'BBAlliance is a community charity in Blackburn and Darwen, Lancashire, running local projects and supporting causes nationally and internationally. [PLACEHOLDER — replace]',
      localized: true,
    },
    {
      name: 'defaultOGImage',
      type: 'upload',
      admin: { description: 'Image used when pages are shared on social media (1200×630 works best).' },
      relationTo: 'media',
    },
    {
      name: 'searchConsoleVerification',
      type: 'text',
      admin: {
        description: 'Google Search Console verification code (the content value only, not the whole tag).',
      },
    },
    {
      name: 'allowIndexing',
      type: 'checkbox',
      admin: {
        description:
          '⚠️ IMPORTANT: unticking this hides the ENTIRE site from Google and other search engines. Only untick before launch or in an emergency.',
      },
      defaultValue: true,
      label: 'Allow search engines to index this site',
    },
    {
      type: 'collapsible',
      label: 'Organisation details (used for structured data)',
      fields: [
        {
          name: 'legalName',
          type: 'text',
          defaultValue: 'BBAlliance [PLACEHOLDER — replace with registered name]',
        },
        {
          name: 'foundingYear',
          type: 'text',
        },
        {
          name: 'areaServed',
          type: 'text',
          defaultValue: 'Blackburn with Darwen, Lancashire, UK',
        },
      ],
    },
  ],
  hooks: {
    afterChange: [makeRevalidateGlobal('seo-settings')],
  },
}
