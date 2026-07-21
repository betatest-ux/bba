import type { GlobalConfig } from 'payload'

import { isAdmin } from '@/access/roles'

export const EmailSettings: GlobalConfig = {
  slug: 'email-settings',
  label: 'Email & Notifications',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    description: 'Where form submissions and notifications are sent.',
    group: 'Settings',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'fromName',
          type: 'text',
          admin: { width: '50%' },
          defaultValue: 'BBAlliance',
          required: true,
        },
        {
          name: 'fromEmail',
          type: 'email',
          admin: {
            description: 'Must be a sender your email provider allows.',
            width: '50%',
          },
          defaultValue: 'noreply@bballiance.org.uk',
          required: true,
        },
      ],
    },
    {
      name: 'contactRecipients',
      type: 'array',
      admin: { description: 'Who receives contact form enquiries.' },
      fields: [{ name: 'email', type: 'email', required: true }],
      minRows: 1,
      required: true,
    },
    {
      name: 'jobsRecipients',
      type: 'array',
      admin: { description: 'Who receives job applications.' },
      fields: [{ name: 'email', type: 'email', required: true }],
      minRows: 1,
      required: true,
    },
  ],
}
