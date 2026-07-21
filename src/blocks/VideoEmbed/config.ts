import type { Block } from 'payload'

export const VideoEmbed: Block = {
  slug: 'videoEmbed',
  interfaceName: 'VideoEmbedBlock',
  labels: {
    singular: 'Video Embed',
    plural: 'Video Embeds',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      admin: {
        description: 'A YouTube or Vimeo link. The video only loads after the visitor clicks play (cookie-friendly).',
      },
      required: true,
      validate: (value: null | string | string[] | undefined) => {
        if (typeof value !== 'string') return 'Enter a video URL'
        if (/youtube\.com|youtu\.be|vimeo\.com/.test(value)) return true
        return 'Only YouTube and Vimeo links are supported'
      },
    },
    {
      name: 'title',
      type: 'text',
      admin: { description: 'Accessible name for the video, e.g. “Our 2025 highlights film”.' },
      localized: true,
      required: true,
    },
    {
      name: 'poster',
      type: 'upload',
      admin: { description: 'Optional cover image shown before the video is played.' },
      relationTo: 'media',
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
    },
  ],
}
