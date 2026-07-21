import type { CollectionConfig } from 'payload'

import crypto from 'crypto'

import { isAdmin, isAdminOrEditor, noApiWrite } from '@/access/roles'

export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
  labels: {
    singular: 'Newsletter Subscriber',
    plural: 'Newsletter Subscribers',
  },
  access: {
    create: noApiWrite,
    delete: isAdmin,
    read: isAdminOrEditor,
    update: noApiWrite,
  },
  admin: {
    defaultColumns: ['email', 'confirmed', 'consentAt'],
    description:
      'People who signed up to the newsletter. “Confirmed” means they clicked the link in their confirmation email. Export as CSV from the dashboard.',
    group: 'Inbox',
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      admin: { readOnly: true },
      required: true,
      unique: true,
    },
    {
      name: 'confirmed',
      type: 'checkbox',
      admin: {
        description: 'Set automatically when the confirmation link is clicked.',
        position: 'sidebar',
        readOnly: true,
      },
      defaultValue: false,
    },
    {
      name: 'consentAt',
      type: 'date',
      admin: {
        description: 'When they ticked the consent box.',
        readOnly: true,
      },
    },
    {
      name: 'confirmedAt',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'unsubscribeToken',
      type: 'text',
      admin: { hidden: true },
      hooks: {
        beforeChange: [
          ({ operation, value }) => {
            if (operation === 'create' && !value) {
              return crypto.randomBytes(24).toString('hex')
            }
            return value
          },
        ],
      },
      index: true,
    },
  ],
  timestamps: true,
}
