import type { GlobalConfig } from 'payload'

import { isAdmin } from '@/access/roles'
import { passesAA } from '@/design/contrast'
import { accentOptions, surfaces, type AccentKey } from '@/design/tokens'
import { makeRevalidateGlobal } from './revalidateGlobal'

/**
 * Curated appearance controls. Accents are a fixed, pre-validated set — and we
 * still re-check WCAG AA contrast at save time so a future developer cannot
 * quietly add a failing option. Font/size controls are deliberately absent
 * (see DESIGN.md and ADMIN-GUIDE.md).
 */
export const Appearance: GlobalConfig = {
  slug: 'appearance',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    description:
      'The site’s look: accent colour, hero style and dark mode. Colour options are limited to combinations that pass WCAG AA accessibility checks.',
    group: 'Settings',
  },
  fields: [
    {
      name: 'accent',
      type: 'select',
      admin: {
        description: 'Used for buttons, links and highlights across the site.',
      },
      defaultValue: 'brick',
      label: 'Accent colour',
      options: (Object.keys(accentOptions) as AccentKey[]).map((key) => ({
        label: accentOptions[key].label,
        value: key,
      })),
      required: true,
      validate: (value: unknown) => {
        const key = value as AccentKey
        const option = accentOptions[key]
        if (!option) return 'Unknown accent colour'
        const failures: string[] = []
        if (!passesAA(option.light.accent, surfaces.light))
          failures.push('accent text on light background')
        if (!passesAA(option.light.on, option.light.accent))
          failures.push('button text on accent (light mode)')
        if (!passesAA(option.dark.accent, surfaces.dark))
          failures.push('accent text on dark background')
        if (!passesAA(option.dark.on, option.dark.accent))
          failures.push('button text on accent (dark mode)')
        if (failures.length > 0) {
          return `This colour fails WCAG AA contrast for: ${failures.join(', ')}. Choose another option.`
        }
        return true
      },
    },
    {
      name: 'heroStyle',
      type: 'select',
      admin: {
        description: 'How the big banner at the top of the homepage is laid out.',
      },
      defaultValue: 'weave',
      label: 'Hero style',
      options: [
        { label: 'Weave — photo with woven pattern underlay', value: 'weave' },
        { label: 'Full photo — edge-to-edge image', value: 'photo' },
        { label: 'Split — text beside photo', value: 'split' },
      ],
      required: true,
    },
    {
      name: 'darkModeEnabled',
      type: 'checkbox',
      admin: {
        description: 'Let visitors switch to a dark colour scheme.',
      },
      defaultValue: true,
      label: 'Offer dark mode',
    },
    {
      name: 'localeSwitcherEnabled',
      type: 'checkbox',
      admin: {
        description:
          'Show the language switcher in the site header. Turn this on once translated content exists — the plumbing is already in place.',
      },
      defaultValue: false,
      label: 'Show language switcher',
    },
  ],
  hooks: {
    afterChange: [makeRevalidateGlobal('appearance')],
  },
}
