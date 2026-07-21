import type { GlobalConfig } from 'payload'

import { isAdmin } from '@/access/roles'
import { makeRevalidateGlobal } from './revalidateGlobal'

export const CustomCode: GlobalConfig = {
  slug: 'custom-code',
  label: 'Custom Code',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    description:
      '⚠️ ADMINS ONLY — advanced. Scripts pasted here are injected into every page. A broken script can break the whole site. Non-essential scripts are held back until the visitor accepts cookies.',
    group: 'Settings',
  },
  fields: [
    {
      name: 'headCode',
      type: 'code',
      admin: {
        description:
          'HTML added to <head> — e.g. a site verification tag. ⚠️ Only paste code from services you trust.',
        language: 'html',
      },
      label: 'Head code',
    },
    {
      name: 'bodyEndCode',
      type: 'code',
      admin: {
        description: 'HTML added just before </body> — e.g. an analytics snippet.',
        language: 'html',
      },
      label: 'End-of-body code',
    },
    {
      name: 'requireConsent',
      type: 'checkbox',
      admin: {
        description:
          'When ticked (recommended), scripts above only run after the visitor accepts analytics cookies. Only untick for strictly-necessary tags such as site verification.',
      },
      defaultValue: true,
      label: 'Only run after cookie consent',
    },
  ],
  hooks: {
    afterChange: [makeRevalidateGlobal('custom-code')],
  },
}
