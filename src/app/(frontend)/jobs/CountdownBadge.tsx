'use client'

import React, { useEffect, useState } from 'react'

import { cn } from '@/utilities/ui'

const DAY_MS = 24 * 60 * 60 * 1000

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

/**
 * Small "N days left" chip for vacancy cards. Days are computed on the client
 * after mount (the page is statically cached, so the server's idea of "today"
 * can be stale) — rendering nothing until mounted avoids hydration mismatches.
 */
export const CountdownBadge: React.FC<{ className?: string; closingDate: string }> = ({
  className,
  closingDate,
}) => {
  const [daysLeft, setDaysLeft] = useState<number | null>(null)

  useEffect(() => {
    const closing = new Date(closingDate)
    if (Number.isNaN(closing.getTime())) return
    setDaysLeft(Math.round((startOfDay(closing) - startOfDay(new Date())) / DAY_MS))
  }, [closingDate])

  if (daysLeft === null || daysLeft < 0) return null

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        daysLeft <= 7 ? 'bg-gold/20 text-foreground' : 'bg-secondary text-muted-foreground',
        className,
      )}
    >
      {daysLeft === 0 ? 'Closes today' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
    </span>
  )
}
