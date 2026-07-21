'use client'

import { motion, useInView, useReducedMotion } from 'framer-motion'
import React, { useRef } from 'react'

import { cn } from '@/utilities/ui'

const gbp = (value: number): string =>
  new Intl.NumberFormat('en-GB', {
    currency: 'GBP',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)

/**
 * The appeal “thermometer”: a weave-textured track with a solid accent band
 * that animates to the raised amount on first view. Exposed to assistive tech
 * as a standard progressbar with a plain-English label.
 */
export const Thermometer: React.FC<{
  className?: string
  raised: number
  target: number
}> = ({ className, raised, target }) => {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.6, once: true })
  const reduceMotion = useReducedMotion()

  const percent = Math.min(100, Math.round((raised / Math.max(target, 1)) * 100))

  return (
    <div className={cn('max-w-xl', className)} ref={ref}>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <p className="text-2xl font-display font-bold">
          {gbp(raised)} <span className="text-base font-normal text-muted-foreground">raised</span>
        </p>
        <p className="text-sm text-muted-foreground">of {gbp(target)} target</p>
      </div>
      <div
        aria-label={`${gbp(raised)} raised of ${gbp(target)} target`}
        aria-valuemax={target}
        aria-valuemin={0}
        aria-valuenow={raised}
        className="relative h-5 overflow-hidden rounded-full border border-border bg-card"
        role="progressbar"
      >
        {/* weave-textured track */}
        <svg aria-hidden className="absolute inset-0 h-full w-full text-foreground/10" preserveAspectRatio="none">
          <pattern height="8" id="weave-track" patternUnits="userSpaceOnUse" width="16">
            <path d="M0 4 Q4 0 8 4 T16 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </pattern>
          <rect fill="url(#weave-track)" height="100%" width="100%" />
        </svg>
        <motion.div
          animate={inView ? { width: `${percent}%` } : undefined}
          className="relative h-full rounded-full bg-brand"
          initial={{ width: reduceMotion ? `${percent}%` : '4%' }}
          transition={{ duration: reduceMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <p className="mt-2 text-sm font-medium text-brand">{percent}% of the way there</p>
    </div>
  )
}
