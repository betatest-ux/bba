import { cn } from '@/utilities/ui'
import React from 'react'

/**
 * The BBAlliance signature element: interlaced warp/weft bands referencing
 * Blackburn's weaving heritage. Inherits `currentColor` so it tints with the
 * active accent. Purely decorative — hidden from assistive tech.
 */
export const Weave: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    aria-hidden="true"
    className={cn('block', className)}
    fill="none"
    preserveAspectRatio="xMidYMid meet"
    viewBox="0 0 160 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g strokeLinecap="round" strokeWidth="5">
      <path d="M2 12 C 22 2, 38 22, 58 12 S 94 2, 114 12 118 22 158 12" opacity="0.35" stroke="currentColor" />
      <path d="M2 12 C 22 22, 38 2, 58 12 S 94 22, 114 12 118 2 158 12" stroke="currentColor" />
    </g>
  </svg>
)

/**
 * Full-width section divider variant of the weave.
 */
export const WeaveDivider: React.FC<{ className?: string }> = ({ className }) => (
  <div aria-hidden="true" className={cn('overflow-hidden py-2 text-(--bb-accent)', className)}>
    <svg
      className="mx-auto h-4 w-full max-w-3xl opacity-70"
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 600 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g strokeLinecap="round" strokeWidth="3">
        <path
          d="M0 8 C 40 0, 80 16, 120 8 S 200 0, 240 8 320 16 360 8 440 0 480 8 560 16 600 8"
          opacity="0.4"
          stroke="currentColor"
        />
        <path
          d="M0 8 C 40 16, 80 0, 120 8 S 200 16, 240 8 320 0 360 8 440 16 480 8 560 0 600 8"
          stroke="currentColor"
        />
      </g>
    </svg>
  </div>
)
