import { HeaderClient } from './Component.client'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

export async function Header() {
  const [headerData, siteSettings] = await Promise.all([
    getCachedGlobal('header', 1)(),
    getCachedGlobal('site-settings', 1)().catch(() => null),
  ])

  const logoLight =
    siteSettings?.logoLight && typeof siteSettings.logoLight === 'object'
      ? getMediaUrl(siteSettings.logoLight.url)
      : null
  const logoDark =
    siteSettings?.logoDark && typeof siteSettings.logoDark === 'object'
      ? getMediaUrl(siteSettings.logoDark.url)
      : null

  return (
    <HeaderClient
      data={headerData}
      logoDark={logoDark}
      logoLight={logoLight}
      siteName={siteSettings?.siteName || 'BBAlliance'}
    />
  )
}
