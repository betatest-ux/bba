import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'BBAlliance is a community charity in Blackburn and Darwen, Lancashire — local projects, national and international support.',
  images: [
    {
      url: `${getServerSideURL()}/og-default.png`,
    },
  ],
  siteName: 'BBAlliance',
  title: 'BBAlliance',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
