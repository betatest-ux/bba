'use client'

import { motion, useReducedMotion } from 'framer-motion'
import React from 'react'

/**
 * Scroll-reveal wrapper: 12px rise + fade, triggered once at 20% visibility.
 * Collapses to a plain fade (near-instant) when the visitor prefers reduced
 * motion. Keep children semantic — this adds no landmarks of its own.
 */
export const Reveal: React.FC<{
  as?: 'div' | 'li' | 'section'
  children: React.ReactNode
  className?: string
  delay?: number
}> = ({ as = 'div', children, className, delay = 0 }) => {
  const reduceMotion = useReducedMotion()
  const Component = motion[as]

  return (
    <Component
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      transition={{
        delay: reduceMotion ? 0 : delay,
        duration: reduceMotion ? 0.15 : 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      viewport={{ amount: 0.2, once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </Component>
  )
}

/** Stagger container — children Reveal items pass explicit delays instead. */
export const RevealGroup: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => <div className={className}>{children}</div>
