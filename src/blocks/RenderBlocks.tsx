import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { AppealProgressBlock } from '@/blocks/AppealProgress/Component'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { EventsStripBlock } from '@/blocks/EventsStrip/Component'
import { FAQAccordionBlock } from '@/blocks/FAQAccordion/Component'
import { FeaturedProjectsBlock } from '@/blocks/FeaturedProjects/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { GalleryBlock } from '@/blocks/Gallery/Component'
import { ImageTextSplitBlock } from '@/blocks/ImageTextSplit/Component'
import { MapBlock } from '@/blocks/MapBlock/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { PartnerLogosBlock } from '@/blocks/PartnerLogos/Component'
import { StatRowBlock } from '@/blocks/StatRow/Component'
import { TestimonialsBlock } from '@/blocks/TestimonialsBlock/Component'
import { TimelineBlock } from '@/blocks/Timeline/Component'
import { VideoEmbedBlock } from '@/blocks/VideoEmbed/Component'

const blockComponents = {
  appealProgress: AppealProgressBlock,
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  eventsStrip: EventsStripBlock,
  faqAccordion: FAQAccordionBlock,
  featuredProjects: FeaturedProjectsBlock,
  formBlock: FormBlock,
  gallery: GalleryBlock,
  imageTextSplit: ImageTextSplitBlock,
  mapBlock: MapBlock,
  mediaBlock: MediaBlock,
  partnerLogos: PartnerLogosBlock,
  statRow: StatRowBlock,
  testimonialsBlock: TestimonialsBlock,
  timeline: TimelineBlock,
  videoEmbed: VideoEmbedBlock,
}

/**
 * Blocks that manage their own <section> spacing/backgrounds; the classic
 * template blocks still get the default vertical margin wrapper.
 */
const selfSpacing = new Set([
  'appealProgress',
  'eventsStrip',
  'faqAccordion',
  'featuredProjects',
  'gallery',
  'imageTextSplit',
  'mapBlock',
  'partnerLogos',
  'statRow',
  'testimonialsBlock',
  'timeline',
  'videoEmbed',
])

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              if (selfSpacing.has(blockType)) {
                return (
                  <Fragment key={index}>
                    {/* @ts-expect-error there may be some mismatch between the expected types here */}
                    <Block {...block} disableInnerContainer />
                  </Fragment>
                )
              }
              return (
                <div className="my-16" key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
