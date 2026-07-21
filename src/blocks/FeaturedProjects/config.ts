import type { Block } from 'payload'

export const FeaturedProjects: Block = {
  slug: 'featuredProjects',
  interfaceName: 'FeaturedProjectsBlock',
  labels: {
    singular: 'Featured Projects',
    plural: 'Featured Projects Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'What we do',
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
      name: 'projects',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      relationTo: 'projects',
    },
    {
      name: 'category',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'latest',
        description: 'Optionally limit to one category.',
      },
      relationTo: 'project-categories',
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
