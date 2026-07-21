import type { GlobalConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { isAdmin } from '@/access/roles'
import { makeRevalidateGlobal } from './revalidateGlobal'

export const DonationSettings: GlobalConfig = {
  slug: 'donation-settings',
  label: 'Donation Settings',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    description:
      'Where “Donate” buttons send people, and the wording around donations. Switching provider (JustGiving, Stripe, etc.) is just a matter of changing the link.',
    group: 'Settings',
  },
  fields: [
    {
      name: 'donateUrl',
      type: 'text',
      admin: {
        description:
          'Full link to your donation page — e.g. a JustGiving page or Stripe Payment Link. Every Donate button on the site uses this.',
      },
      defaultValue: 'https://www.justgiving.com/[PLACEHOLDER-replace]',
      required: true,
    },
    {
      name: 'donateLabel',
      type: 'text',
      defaultValue: 'Donate',
      localized: true,
      required: true,
    },
    {
      name: 'appealText',
      type: 'richText',
      admin: { description: 'Default wording shown on the Donate page.' },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      localized: true,
    },
    {
      name: 'giftAidText',
      type: 'richText',
      admin: {
        description: 'The Gift Aid explainer — UK taxpayers can add 25% at no extra cost.',
      },
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
    afterChange: [makeRevalidateGlobal('donation-settings')],
  },
}
