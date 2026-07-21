import type { Block } from 'payload'

export const PartnerLogos: Block = {
  slug: 'partnerLogos',
  interfaceName: 'PartnerLogosBlock',
  labels: {
    singular: 'Partner Logo Strip',
    plural: 'Partner Logo Strips',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Working alongside',
      localized: true,
    },
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'all',
      options: [
        { label: 'All partners', value: 'all' },
        { label: 'By type', value: 'type' },
        { label: 'Hand-picked', value: 'selection' },
      ],
    },
    {
      name: 'partnerType',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'type',
      },
      options: [
        { label: 'Funders', value: 'funder' },
        { label: 'Partners', value: 'partner' },
        { label: 'Sponsors', value: 'sponsor' },
      ],
    },
    {
      name: 'partners',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      relationTo: 'partners',
    },
  ],
}
