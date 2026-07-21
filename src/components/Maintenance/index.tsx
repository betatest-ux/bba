import React from 'react'

import type { MaintenanceMode } from '@/payload-types'

import RichText from '@/components/RichText'
import { Weave } from '@/components/Weave'

export const MaintenanceScreen: React.FC<{ settings: MaintenanceMode }> = ({ settings }) => {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-24">
      <div className="max-w-xl text-center">
        <Weave className="mx-auto mb-10 h-6 w-40 text-(--bb-accent)" />
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
          {settings.heading || 'We’ll be back soon'}
        </h1>
        {settings.message ? (
          <RichText data={settings.message} enableGutter={false} />
        ) : (
          <p className="text-lg text-muted-foreground">
            We’re making some improvements. Please check back shortly.
          </p>
        )}
        <p className="mt-10 text-sm text-muted-foreground">
          BBAlliance — Blackburn &amp; Darwen. Staff can still{' '}
          <a className="underline" href="/admin">
            sign in
          </a>
          .
        </p>
      </div>
    </main>
  )
}
