import type { GlobalConfig } from 'payload'

import { isAdmin } from '@/access/roles'
import { makeRevalidateGlobal } from './revalidateGlobal'

export const ContactSettings: GlobalConfig = {
  slug: 'contact-settings',
  label: 'Contact Settings',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    description: 'Public contact details, office hours, map location and social media links.',
    group: 'Settings',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          type: 'email',
          admin: { width: '50%' },
          defaultValue: 'hello@bballiance.org.uk',
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'officeHours',
      type: 'array',
      admin: { description: 'e.g. “Monday – Friday” / “9am – 5pm”.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'days', type: 'text', admin: { width: '50%' }, localized: true, required: true },
            { name: 'hours', type: 'text', admin: { width: '50%' }, localized: true, required: true },
          ],
        },
      ],
    },
    {
      name: 'address',
      type: 'textarea',
      admin: { description: 'The address shown on the contact page (may differ from the registered address).' },
      localized: true,
    },
    {
      type: 'collapsible',
      label: 'Map location',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'latitude', type: 'number', admin: { width: '33%' }, defaultValue: 53.7486 },
            { name: 'longitude', type: 'number', admin: { width: '33%' }, defaultValue: -2.4842 },
            { name: 'mapZoom', type: 'number', admin: { width: '33%' }, defaultValue: 15, max: 19, min: 3 },
          ],
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      admin: {
        description: 'Drag to reorder. Icons match the platform automatically.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'platform',
              type: 'select',
              admin: { width: '40%' },
              options: [
                { label: 'Facebook', value: 'facebook' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'X (Twitter)', value: 'x' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'YouTube', value: 'youtube' },
                { label: 'TikTok', value: 'tiktok' },
                { label: 'WhatsApp', value: 'whatsapp' },
              ],
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              admin: { width: '60%' },
              required: true,
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [makeRevalidateGlobal('contact-settings')],
  },
}
