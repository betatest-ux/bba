import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { Partner, PartnerLogosBlock as PartnerLogosBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'
import { Reveal } from '@/components/Motion/Reveal'

export const PartnerLogosBlock: React.FC<PartnerLogosBlockProps> = async ({
  heading,
  partnerType,
  partners: selected,
  populateBy,
}) => {
  let partners: Partner[] = []

  if (populateBy === 'selection' && selected?.length) {
    partners = selected.filter((partner): partner is Partner => typeof partner === 'object')
  } else {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'partners',
      limit: 12,
      overrideAccess: false,
      ...(populateBy === 'type' && partnerType
        ? { where: { partnerType: { equals: partnerType } } }
        : {}),
    })
    partners = result.docs
  }

  if (partners.length === 0) return null

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        {heading && (
          <Reveal>
            <p className="mb-8 text-center font-display text-sm uppercase tracking-widest text-muted-foreground">
              {heading}
            </p>
          </Reveal>
        )}
        <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 list-none p-0">
          {partners.map((partner, index) => {
            const logo =
              partner.logo && typeof partner.logo === 'object' ? (
                <Media
                  imgClassName="h-12 w-auto max-w-[160px] object-contain opacity-70 transition-opacity duration-200 hover:opacity-100"
                  resource={partner.logo}
                  size="160px"
                />
              ) : (
                <span>{partner.name}</span>
              )

            return (
              <Reveal as="li" delay={index * 0.04} key={partner.id}>
                {partner.url ? (
                  <a
                    aria-label={partner.name}
                    href={partner.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {logo}
                  </a>
                ) : (
                  logo
                )}
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
