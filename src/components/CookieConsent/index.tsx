import React from 'react'

import { getCachedGlobal } from '@/utilities/getGlobals'
import { CookieConsentClient } from './index.client'

/**
 * Cookie banner + consent-gated custom code. Scripts added via Settings →
 * Custom Code only run after the visitor accepts (unless the admin has
 * explicitly marked them consent-exempt).
 */
export async function CookieConsent() {
  const [cookieSettings, customCode] = await Promise.all([
    getCachedGlobal('cookie-settings', 0)().catch(() => null),
    getCachedGlobal('custom-code', 0)().catch(() => null),
  ])

  const gatedHead = customCode?.requireConsent !== false ? (customCode?.headCode ?? null) : null
  const gatedBody = customCode?.requireConsent !== false ? (customCode?.bodyEndCode ?? null) : null

  return (
    <CookieConsentClient
      acceptLabel={cookieSettings?.acceptLabel || 'Accept all'}
      categories={(cookieSettings?.categories ?? []).map((category) => ({
        alwaysOn: Boolean(category.alwaysOn),
        description: category.description ?? '',
        key: category.key,
        label: category.label,
      }))}
      gatedBodyCode={gatedBody}
      gatedHeadCode={gatedHead}
      heading={cookieSettings?.bannerHeading || 'Cookies on this site'}
      message={cookieSettings?.bannerText ?? null}
      rejectLabel={cookieSettings?.rejectLabel || 'Essential only'}
    />
  )
}

/** Un-gated custom code (admin ticked "no consent needed" — e.g. verification tags). */
export async function UngatedCustomCode({ position }: { position: 'body' | 'head' }) {
  const customCode = await getCachedGlobal('custom-code', 0)().catch(() => null)
  if (customCode?.requireConsent !== false) return null
  const code = position === 'head' ? customCode?.headCode : customCode?.bodyEndCode
  if (!code) return null
  return <div dangerouslySetInnerHTML={{ __html: code }} style={{ display: 'none' }} />
}
