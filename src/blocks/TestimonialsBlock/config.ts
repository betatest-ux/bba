import type { Block } from 'payload'

export const TestimonialsBlock: Block = {
  slug: 'testimonialsBlock',
  interfaceName: 'TestimonialsBlockType',
  labels: {
    singular: 'Testimonials',
    plural: 'Testimonials Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
    },
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'latest',
      options: [
        { label: 'Latest', value: 'latest' },
        { label: 'Hand-picked', value: 'selection' },
      ],
    },
    {
      name: 'testimonials',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      relationTo: 'testimonials',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'latest',
      },
      defaultValue: 3,
      max: 6,
      min: 1,
    },
  ],
}
