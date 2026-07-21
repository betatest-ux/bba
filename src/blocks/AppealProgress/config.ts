import type { Block } from 'payload'

export const AppealProgress: Block = {
  slug: 'appealProgress',
  interfaceName: 'AppealProgressBlock',
  labels: {
    singular: 'Appeal Spotlight',
    plural: 'Appeal Spotlights',
  },
  fields: [
    {
      name: 'appeal',
      type: 'relationship',
      admin: {
        description: 'Which fundraising appeal to feature. The thermometer animates to the amount raised.',
      },
      relationTo: 'appeals',
      required: true,
    },
    {
      name: 'showStory',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show the appeal story alongside the progress bar',
    },
    {
      name: 'compact',
      type: 'checkbox',
      defaultValue: false,
      label: 'Compact layout (bar and button only)',
    },
  ],
}
