'use client'

import { MapPin } from 'lucide-react'
import React, { useState } from 'react'

/**
 * Click-to-load OpenStreetMap embed. Before interaction, nothing is requested
 * from any third party — just a styled placeholder with the address.
 */
export const MapLoader: React.FC<{
  address?: string
  lat: number
  lng: number
  zoom: number
}> = ({ address, lat, lng, zoom }) => {
  const [loaded, setLoaded] = useState(false)

  const bbox = [lng - 0.008, lat - 0.004, lng + 0.008, lat + 0.004].join('%2C')
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`

  if (loaded) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border">
        <iframe
          className="h-[420px] w-full"
          loading="lazy"
          referrerPolicy="no-referrer"
          src={src}
          title={`Map showing ${address || 'our location'}`}
        />
        <p className="bg-card px-4 py-2 text-xs text-muted-foreground">
          Map ©{' '}
          <a
            className="underline"
            href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            OpenStreetMap
          </a>{' '}
          contributors
        </p>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary">
      {/* request-free decorative “map” */}
      <svg aria-hidden className="h-[420px] w-full text-foreground/10" preserveAspectRatio="none">
        <pattern height="28" id="map-grid" patternUnits="userSpaceOnUse" width="28">
          <path d="M28 0H0v28" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
        <rect fill="url(#map-grid)" height="100%" width="100%" />
        <path d="M0 300 C 150 260, 240 340, 420 300 S 640 240, 900 280" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M180 0 C 200 120, 160 260, 220 420" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <MapPin aria-hidden className="text-brand" size={36} />
        {address && <p className="max-w-xs whitespace-pre-line font-medium">{address}</p>}
        <button
          className="inline-flex h-12 items-center rounded-full bg-brand px-6 font-medium text-brand-on transition-transform duration-150 hover:scale-[1.03]"
          onClick={() => setLoaded(true)}
          type="button"
        >
          Load interactive map
        </button>
        <p className="text-xs text-muted-foreground">
          Loads from OpenStreetMap only when you choose to.
        </p>
      </div>
    </div>
  )
}
