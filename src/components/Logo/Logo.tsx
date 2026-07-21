import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  logoUrl?: string | null
  priority?: 'auto' | 'high' | 'low'
  siteName?: string
}

/**
 * BBAlliance wordmark. If a logo has been uploaded in Site Identity settings
 * it is used; otherwise a typographic wordmark with the weave mark renders,
 * so the site never shows a broken or third-party logo.
 */
export const Logo = (props: Props) => {
  const { className, loading: loadingFromProps, logoUrl, priority: priorityFromProps, siteName = 'BBAlliance' } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  if (logoUrl) {
    return (
      /* eslint-disable @next/next/no-img-element */
      <img
        alt={`${siteName} logo`}
        className={clsx('h-9 w-auto max-w-[11rem] object-contain', className)}
        decoding="async"
        fetchPriority={priority}
        height={36}
        loading={loading}
        src={logoUrl}
        width={176}
      />
    )
  }

  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <svg
        aria-hidden="true"
        className="h-7 w-9 text-brand"
        fill="none"
        viewBox="0 0 36 28"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g strokeLinecap="round" strokeWidth="4">
          <path d="M2 14 C 8 4, 14 24, 20 14 S 30 4, 34 14" opacity="0.45" stroke="currentColor" />
          <path d="M2 14 C 8 24, 14 4, 20 14 S 30 24, 34 14" stroke="currentColor" />
        </g>
      </svg>
      <span className="font-display text-xl font-bold tracking-tight leading-none">
        {siteName}
      </span>
    </span>
  )
}
