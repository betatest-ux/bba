import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { Bricolage_Grotesque, Figtree } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { AnnouncementBar } from '@/components/AnnouncementBar'
import { CookieConsent, UngatedCustomCode } from '@/components/CookieConsent'
import { MaintenanceScreen } from '@/components/Maintenance'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { accentOptions, DEFAULT_ACCENT, type AccentKey } from '@/design/tokens'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getMediaUrl } from '@/utilities/getMediaUrl'
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

  const [appearance, maintenance, seoSettings, siteSettings, contactSettings] = await Promise.all([
    getCachedGlobal('appearance', 0)().catch(() => null),
    getCachedGlobal('maintenance-mode', 0)().catch(() => null),
    getCachedGlobal('seo-settings', 0)().catch(() => null),
    getCachedGlobal('site-settings', 1)().catch(() => null),
    getCachedGlobal('contact-settings', 0)().catch(() => null),
  ])

  const accentKey: AccentKey = (appearance?.accent as AccentKey) || DEFAULT_ACCENT
  const accent = accentOptions[accentKey] ?? accentOptions[DEFAULT_ACCENT]

  // Maintenance mode: the public site renders the "back soon" screen; the
  // admin panel is unaffected and editors can still browse via live preview.
  const underMaintenance = Boolean(maintenance?.enabled) && !isEnabled

  const faviconUrl =
    siteSettings?.favicon && typeof siteSettings.favicon === 'object'
      ? getMediaUrl(siteSettings.favicon.url)
      : null

  // Organization JSON-LD from the admin-editable settings.
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: siteSettings?.siteName || 'BBAlliance',
    ...(seoSettings?.legalName ? { legalName: seoSettings.legalName } : {}),
    url: getServerSideURL(),
    ...(seoSettings?.areaServed ? { areaServed: seoSettings.areaServed } : {}),
    ...(seoSettings?.foundingYear ? { foundingDate: seoSettings.foundingYear } : {}),
    ...(contactSettings?.email ? { email: contactSettings.email } : {}),
    ...(contactSettings?.phone ? { telephone: contactSettings.phone } : {}),
    ...(contactSettings?.socialLinks?.length
      ? { sameAs: contactSettings.socialLinks.map((social) => social.url) }
      : {}),
    ...(siteSettings?.registeredAddress
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: siteSettings.registeredAddress.replace(/\n/g, ', '),
          },
        }
      : {}),
  }

  return (
    <html
      className={cn(displayFont.variable, bodyFont.variable)}
      data-accent={accentKey}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        {faviconUrl ? (
          <link href={faviconUrl} rel="icon" />
        ) : (
          <>
            <link href="/favicon.ico" rel="icon" sizes="32x32" />
            <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
          </>
        )}
        {seoSettings?.searchConsoleVerification && (
          <meta content={seoSettings.searchConsoleVerification} name="google-site-verification" />
        )}
        {seoSettings?.allowIndexing === false && <meta content="noindex, nofollow" name="robots" />}
        <style
          // The admin-selected accent trio (WCAG AA pre-validated) as CSS vars.
          dangerouslySetInnerHTML={{
            __html: `:root{--bb-accent:${accent.light.accent};--bb-accent-on:${accent.light.on};--bb-accent-soft:${accent.light.soft};}
[data-theme='dark']{--bb-accent:${accent.dark.accent};--bb-accent-on:${accent.dark.on};--bb-accent-soft:${accent.dark.soft};}`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          type="application/ld+json"
        />
        <UngatedCustomCode position="head" />
      </head>
      <body>
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-6 focus:py-3 focus:font-semibold focus:text-brand-on"
          href="#main-content"
        >
          Skip to content
        </a>
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
              <AnnouncementBar />
              <Header />
              <main className="flex-1" id="main-content">
                {children}
              </main>
              <Footer />
              <CookieConsent />
            </>
          )}
        </Providers>
        <UngatedCustomCode position="body" />
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
