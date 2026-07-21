import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { Bricolage_Grotesque, Figtree } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { MaintenanceScreen } from '@/components/Maintenance'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { accentOptions, DEFAULT_ACCENT, type AccentKey } from '@/design/tokens'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

const displayFont = Bricolage_Grotesque({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-bricolage',
})

const bodyFont = Figtree({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-figtree',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  const [appearance, maintenance] = await Promise.all([
    getCachedGlobal('appearance', 0)().catch(() => null),
    getCachedGlobal('maintenance-mode', 0)().catch(() => null),
  ])

  const accentKey: AccentKey = (appearance?.accent as AccentKey) || DEFAULT_ACCENT
  const accent = accentOptions[accentKey] ?? accentOptions[DEFAULT_ACCENT]

  // Maintenance mode: the public site renders the "back soon" screen; the
  // admin panel is unaffected and editors can still browse via live preview.
  const underMaintenance = Boolean(maintenance?.enabled) && !isEnabled

  return (
    <html
      className={cn(displayFont.variable, bodyFont.variable)}
      data-accent={accentKey}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <style
          // The admin-selected accent trio (WCAG AA pre-validated) as CSS vars.
          dangerouslySetInnerHTML={{
            __html: `:root{--bb-accent:${accent.light.accent};--bb-accent-on:${accent.light.on};--bb-accent-soft:${accent.light.soft};}
[data-theme='dark']{--bb-accent:${accent.dark.accent};--bb-accent-on:${accent.dark.on};--bb-accent-soft:${accent.dark.soft};}`,
          }}
        />
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          {underMaintenance ? (
            <MaintenanceScreen settings={maintenance!} />
          ) : (
            <>
              <Header />
              {children}
              <Footer />
            </>
          )}
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
  },
}
