'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

export type ActivityCard = {
  categoryIds: (number | string)[]
  categoryTitles: string[]
  id: number | string
  image: { alt: string; height: number; url: string; width: number } | null
  location: string | null
  slug: string
  status: 'completed' | 'ongoing' | 'upcoming'
  summary: string
  title: string
}

const statusLabels: Record<ActivityCard['status'], string> = {
  completed: 'Completed',
  ongoing: 'Ongoing',
  upcoming: 'Coming soon',
}

const statusStyles: Record<ActivityCard['status'], string> = {
  completed: 'bg-secondary text-muted-foreground',
  ongoing: 'bg-moor/15 text-moor dark:bg-moor/25 dark:text-success',
  upcoming: 'bg-gold/20 text-foreground',
}

/**
 * Filterable project grid with FLIP layout animations. Filters are buttons
 * (not links) with pressed state exposed to assistive tech; the result count
 * is announced via aria-live.
 */
export const ActivitiesGrid: React.FC<{
  cards: ActivityCard[]
  categories: { id: number | string; title: string }[]
}> = ({ cards, categories }) => {
  const [categoryFilter, setCategoryFilter] = useState<number | string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ActivityCard['status'] | null>(null)
  const reduceMotion = useReducedMotion()

  const filtered = useMemo(
    () =>
      cards.filter((card) => {
        if (categoryFilter !== null && !card.categoryIds.includes(categoryFilter)) return false
        if (statusFilter !== null && card.status !== statusFilter) return false
        return true
      }),
    [cards, categoryFilter, statusFilter],
  )

  const filterButton = (active: boolean): string =>
    cn(
      'min-h-11 rounded-full border px-4 text-sm font-medium transition-colors duration-150',
      active
        ? 'border-transparent bg-brand text-brand-on'
        : 'border-border bg-card hover:border-foreground/40',
    )

  return (
    <div className="container">
      {/* Filters */}
      <div className="mb-10 space-y-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button
            aria-pressed={categoryFilter === null}
            className={filterButton(categoryFilter === null)}
            onClick={() => setCategoryFilter(null)}
            type="button"
          >
            All themes
          </button>
          {categories.map((category) => (
            <button
              aria-pressed={categoryFilter === category.id}
              className={filterButton(categoryFilter === category.id)}
              key={category.id}
              onClick={() =>
                setCategoryFilter((current) => (current === category.id ? null : category.id))
              }
              type="button"
            >
              {category.title}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {(Object.keys(statusLabels) as ActivityCard['status'][]).map((status) => (
            <button
              aria-pressed={statusFilter === status}
              className={filterButton(statusFilter === status)}
              key={status}
              onClick={() => setStatusFilter((current) => (current === status ? null : status))}
              type="button"
            >
              {statusLabels[status]}
            </button>
          ))}
        </div>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          Showing {filtered.length} of {cards.length} activities
        </p>
      </div>

      {/* Grid */}
      <motion.ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3" layout={!reduceMotion}>
        <AnimatePresence mode="popLayout">
          {filtered.map((card) => (
            <motion.li
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              key={card.id}
              layout={!reduceMotion}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                className="thread-top group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-200 hover:shadow-lg"
                href={`/activities/${card.slug}`}
              >
                <div className="relative aspect-3/2 overflow-hidden bg-loom">
                  {card.image && (
                    <Image
                      alt={card.image.alt}
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      src={getMediaUrl(card.image.url)}
                    />
                  )}
                  <span
                    className={cn(
                      'absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur',
                      statusStyles[card.status],
                    )}
                  >
                    {statusLabels[card.status]}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap gap-2">
                    {card.categoryTitles.map((title) => (
                      <span
                        className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium"
                        key={title}
                      >
                        {title}
                      </span>
                    ))}
                  </div>
                  <h2 className="mt-3 text-h3 group-hover:underline">{card.title}</h2>
                  <p className="mt-2 line-clamp-3 text-muted-foreground">{card.summary}</p>
                  {card.location && (
                    <p className="mt-auto pt-4 text-sm text-muted-foreground">📍 {card.location}</p>
                  )}
                </div>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {filtered.length === 0 && (
        <p className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
          Nothing matches those filters yet — try clearing one.
        </p>
      )}
    </div>
  )
}
