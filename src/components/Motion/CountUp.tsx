'use client'

import { animate, useInView, useReducedMotion } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'

/**
 * Animated count-up for impact stats. Runs once when scrolled into view;
 * renders the final value immediately for reduced-motion users. Uses
 * tabular-nums so the layout never shifts while counting.
 */
export const CountUp: React.FC<{
  className?: string
  prefix?: string | null
  suffix?: string | null
  value: number
}> = ({ className, prefix, suffix, value }) => {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { amount: 0.6, once: true })
  const reduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(reduceMotion ? value : 0)

  useEffect(() => {
    if (!inView) return
    if (reduceMotion) {
      setDisplay(value)
      return
    }
    const controls = animate(0, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    })
    return () => controls.stop()
  }, [inView, reduceMotion, value])

  return (
    <span className={className} ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}
      {display.toLocaleString('en-GB')}
      {suffix}
    </span>
  )
}
