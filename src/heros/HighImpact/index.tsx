'use client'
import { motion, useReducedMotion } from 'framer-motion'
import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

type Props = Page['hero'] & { variant?: 'photo' | 'split' | 'weave' }

/** Big woven background texture for the hero (pure SVG, zero requests). */
const WeaveField: React.FC = () => (
  <svg
    aria-hidden
    className="pointer-events-none absolute inset-0 h-full w-full text-white/[0.07]"
    preserveAspectRatio="none"
  >
    <pattern height="56" id="hero-weave" patternUnits="userSpaceOnUse" width="112">
      <path
        d="M0 28 C 14 8, 28 48, 56 28 S 98 8, 112 28"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
      />
      <path
        d="M0 28 C 14 48, 28 8, 56 28 S 98 48, 112 28"
        fill="none"
        opacity="0.6"
        stroke="currentColor"
        strokeWidth="10"
      />
    </pattern>
    <rect fill="url(#hero-weave)" height="100%" width="100%" />
  </svg>
)

/**
 * Homepage hero with three admin-selectable layouts (Appearance → Hero style):
 * weave (pattern + framed photo), photo (full-bleed), split (text beside photo).
 * Entrance is an orchestrated stagger; reduced-motion collapses to fades.
 */
export const HighImpactHero: React.FC<Props> = ({ links, media, richText, variant = 'weave' }) => {
  const reduceMotion = useReducedMotion()

  const item = (index: number) => ({
    animate: { opacity: 1, y: 0 },
    initial: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 },
    transition: {
      delay: reduceMotion ? 0 : 0.08 * index,
      duration: reduceMotion ? 0.2 : 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  })

  const content = (dark: boolean) => (
    <>
      {richText && (
        <motion.div {...item(0)}>
          <RichText
            className={cn(
              'mb-8 [&_h1]:text-display [&_h2]:text-display [&_p]:text-lg md:[&_p]:text-xl',
              dark ? '[&_p]:text-white/85' : '[&_p]:text-muted-foreground',
            )}
            data={richText}
            enableGutter={false}
          />
        </motion.div>
      )}
      {Array.isArray(links) && links.length > 0 && (
        <motion.ul className="flex flex-wrap gap-4 list-none p-0" {...item(1)}>
          {links.map(({ link }, i) => (
            <li key={i}>
              <CMSLink
                {...link}
                className={cn(
                  'inline-flex h-12 items-center rounded-full px-8 font-semibold transition-transform duration-150 hover:scale-[1.04] active:scale-[0.98]',
                  link.appearance === 'outline'
                    ? dark
                      ? 'border-2 border-white/40 text-white hover:border-white'
                      : 'border-2 border-foreground/25 hover:border-foreground/60'
                    : 'bg-brand text-brand-on',
                )}
                appearance="inline"
              />
            </li>
          ))}
        </motion.ul>
      )}
    </>
  )

  if (variant === 'photo') {
    return (
      <section className="relative flex min-h-[72vh] items-end text-white" data-theme="dark">
        {media && typeof media === 'object' && (
          <Media fill imgClassName="object-cover" priority resource={media} />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/10"
        />
        <div className="container relative z-10 pb-16 pt-40">
          <div className="max-w-2xl">{content(true)}</div>
        </div>
      </section>
    )
  }

  if (variant === 'split') {
    return (
      <section className="border-b border-border bg-background">
        <div className="container grid items-center gap-10 py-16 md:py-24 lg:grid-cols-2">
          <div>{content(false)}</div>
          {media && typeof media === 'object' && (
            <motion.div {...item(2)} className="overflow-hidden rounded-3xl">
              <Media
                imgClassName="aspect-4/3 w-full object-cover"
                priority
                resource={media}
                size="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          )}
        </div>
      </section>
    )
  }

  // Default: weave
  return (
    <section className="relative overflow-hidden bg-loom text-white" data-theme="dark">
      <WeaveField />
      <div className="container relative z-10 grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr]">
        <div>{content(true)}</div>
        {media && typeof media === 'object' && (
          <motion.div
            {...item(2)}
            className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/15"
          >
            <Media
              imgClassName="aspect-4/3 w-full object-cover"
              priority
              resource={media}
              size="(max-width: 1024px) 100vw, 45vw"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1.5 bg-linear-to-r from-brick via-gold to-moor"
            />
          </motion.div>
        )}
      </div>
    </section>
  )
}
