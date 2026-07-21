import React from 'react'

import type { MapBlockType as MapBlockProps } from '@/payload-types'

import { getCachedGlobal } from '@/utilities/getGlobals'
import { MapLoader } from './MapLoader'

/**
 * Cookie-respecting map: renders a local, request-free placeholder until the
 * visitor chooses to load OpenStreetMap.
 */
export const MapBlock: React.FC<MapBlockProps> = async ({
  address,
  heading,
  latitude,
  longitude,
  useContactLocation,
}) => {
  let lat = latitude ?? 53.7486
  let lng = longitude ?? -2.4842
  let zoom = 15
  let displayAddress = address ?? ''

  if (useContactLocation) {
    const contact = await getCachedGlobal('contact-settings', 0)().catch(() => null)
    lat = contact?.latitude ?? lat
    lng = contact?.longitude ?? lng
    zoom = contact?.mapZoom ?? zoom
    displayAddress = contact?.address ?? displayAddress
  }

  return (
    <section className="py-14 md:py-20">
      <div className="container max-w-4xl">
        {heading && <h2 className="text-h2 mb-6">{heading}</h2>}
        <MapLoader address={displayAddress} lat={lat} lng={lng} zoom={zoom} />
      </div>
    </section>
  )
}
