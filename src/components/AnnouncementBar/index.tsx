import React from 'react'

import { getCachedGlobal } from '@/utilities/getGlobals'
import { AnnouncementBarClient } from './index.client'

/**
 * Sitewide dismissible banner. Scheduling (startAt/endAt) is evaluated at
 * render time; pages revalidate often enough for day-level scheduling, and
 * saving the global busts the whole cache immediately.
 */
export async function AnnouncementBar() {
  const settings = await getCachedGlobal('announcement-bar', 1)().catch(() => null)

  if (!settings?.enabled || !settings.message) return null

  const now = Date.now()
  if (settings.startAt && new Date(settings.startAt).getTime() > now) return null
  if (settings.endAt && new Date(settings.endAt).getTime() < now) return null

  // Dismissal key changes whenever the message changes, so a new announcement
  // reappears even for visitors who dismissed the previous one.
  const dismissKey = `bba-announcement-${(settings.updatedAt ?? '').slice(0, 19)}`

  return (
    <AnnouncementBarClient
      dismissKey={dismissKey}
      link={settings.enableLink ? (settings.link ?? null) : null}
      message={settings.message}
      variant={settings.variant ?? 'info'}
    />
  )
}
