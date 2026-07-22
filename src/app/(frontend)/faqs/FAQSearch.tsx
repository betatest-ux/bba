'use client'

import type { Faq } from '@/payload-types'

import { ChevronDown, X } from 'lucide-react'
import React, { useMemo, useState } from 'react'

import RichText from '@/components/RichText'

export type FAQGroup = {
  items: { answer: Faq['answer']; id: string; plain: string; question: string }[]
  title: string
}

/**
 * Searchable FAQ accordion. Native details/summary keeps keyboard and screen
 * reader behaviour dependable; the result count is announced politely.
 */
export const FAQSearch: React.FC<{ groups: FAQGroup[] }> = ({ groups }) => {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return groups
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.question.toLowerCase().includes(term) || item.plain.toLowerCase().includes(term),
        ),
      }))
      .filter((group) => group.items.length > 0)
  }, [groups, query])

  const total = filtered.reduce((sum, group) => sum + group.items.length, 0)

  return (
    <div>
      <div className="relative mb-4">
        <label className="mb-1.5 block font-medium" htmlFor="faq-search">
          Search the FAQs
        </label>
        <input
          className="min-h-11 w-full rounded-xl border border-input bg-card px-4 py-3 pe-12"
          id="faq-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. Gift Aid, DBS check, food pantry…"
          type="search"
          value={query}
        />
        {query && (
          <button
            aria-label="Clear search"
            className="absolute bottom-1.5 end-1.5 flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-secondary"
            onClick={() => setQuery('')}
            type="button"
          >
            <X aria-hidden size={16} />
          </button>
        )}
      </div>

      <p aria-live="polite" className="mb-8 text-sm text-muted-foreground">
        {query ? `${total} answer${total === 1 ? '' : 's'} match “${query}”` : `${total} answers`}
      </p>

      <div className="space-y-10">
        {filtered.map((group) => (
          <section aria-label={group.title} key={group.title}>
            <h2 className="text-h3 mb-4">{group.title}</h2>
            <div className="divide-y divide-border rounded-2xl border border-border bg-card">
              {group.items.map((item) => (
                <details className="group px-6 py-4 open:pb-6" key={item.id} open={Boolean(query)}>
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <ChevronDown
                      aria-hidden
                      className="shrink-0 text-brand transition-transform duration-200 group-open:rotate-180"
                      size={20}
                    />
                  </summary>
                  <div className="pt-2 text-muted-foreground">
                    <RichText data={item.answer} enableGutter={false} />
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
            Nothing matches that search — try a different word, or ask us via the contact page.
          </p>
        )}
      </div>
    </div>
  )
}
