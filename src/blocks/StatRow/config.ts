import type { Block } from 'payload'

export const StatRow: Block = {
  slug: 'statRow',
  interfaceName: 'StatRowBlock',
  labels: {
    singular: 'Impact Stats Row',
    plural: 'Impact Stats Rows',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
    },
    {
      name: 'stats',
      type: 'array',
      admin: {
        description: 'Numbers animate up when they scroll into view.',
      },
      fields: [
        {
          name: 'value',
          type: 'number',
          admin: { description: 'The number itself, digits only — e.g. 1200' },
          required: true,
        },
        {
          name: 'prefix',
          type: 'text',
          admin: { description: 'Shown before the number, e.g. “£”', width: '25%' },
        },
        {
          name: 'suffix',
          type: 'text',
          admin: { description: 'Shown after the number, e.g. “+” or “kg”', width: '25%' },
        },
        {
          name: 'label',
          type: 'text',
          admin: { description: 'What the number means, e.g. “meals served this year”' },
          localized: true,
          required: true,
        },
      ],
      maxRows: 4,
      minRows: 1,
      required: true,
    },
    {
      name: 'background',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Plain', value: 'default' },
        { label: 'Tinted', value: 'tint' },
        { label: 'Dark', value: 'dark' },
      ],
    },
  ],
}
