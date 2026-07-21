import type { Block } from 'payload'

export const MapBlock: Block = {
  slug: 'mapBlock',
  interfaceName: 'MapBlockType',
  labels: {
    singular: 'Map',
    plural: 'Maps',
  },
  fields: [
    {
      name: 'useContactLocation',
      type: 'checkbox',
      admin: {
        description: 'Use the location saved under Settings → Contact Settings.',
      },
      defaultValue: true,
    },
    {
      name: 'latitude',
      type: 'number',
      admin: {
        condition: (_, siblingData) => !siblingData.useContactLocation,
      },
    },
    {
      name: 'longitude',
      type: 'number',
      admin: {
        condition: (_, siblingData) => !siblingData.useContactLocation,
      },
    },
    {
      name: 'address',
      type: 'textarea',
      admin: {
        condition: (_, siblingData) => !siblingData.useContactLocation,
      },
      localized: true,
    },
    {
      name: 'heading',
      type: 'text',
      localized: true,
    },
  ],
}
