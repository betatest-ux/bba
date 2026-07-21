import type { Block } from 'payload'

export const EventsStrip: Block = {
  slug: 'eventsStrip',
  interfaceName: 'EventsStripBlock',
  labels: {
    singular: 'Upcoming Events Strip',
    plural: 'Upcoming Events Strips',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'What’s on',
      localized: true,
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 3,
      max: 6,
      min: 1,
    },
  ],
}
