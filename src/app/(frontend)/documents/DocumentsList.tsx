'use client'

import React, { useMemo, useState } from 'react'

export type DocumentRow = {
  category: string
  categoryLabel: string
  description: string | null
  filesize: number | null
  id: number | string
  title: string
  url: string
  year: number
}

const categoryOptions: { label: string; value: string }[] = [
  { label: 'Annual report', value: 'report' },
  { label: 'Accounts', value: 'accounts' },
  { label: 'Policy', value: 'policy' },
  { label: 'Meeting minutes', value: 'minutes' },
  { label: 'Other', value: 'other' },
]

const formatFileSize = (bytes: number | null): string | null => {
  if (!bytes || bytes <= 0) return null
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const selectClasses =
  'h-11 w-full min-w-40 rounded-lg border border-border bg-card px-3 text-sm sm:w-auto'

/**
 * Filterable list of public documents. Plain selects (no motion), with the
 * result count announced politely to assistive tech as filters change.
 */
export const DocumentsList: React.FC<{ documents: DocumentRow[] }> = ({ documents }) => {
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const years = useMemo(
    () =>
      Array.from(new Set(documents.map((doc) => doc.year))).sort(
        (yearA, yearB) => yearB - yearA,
      ),
    [documents],
  )

  const filtered = useMemo(
    () =>
      documents.filter((doc) => {
        if (yearFilter !== 'all' && String(doc.year) !== yearFilter) return false
        if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false
        return true
      }),
    [documents, yearFilter, categoryFilter],
  )

  const clearFilters = () => {
    setYearFilter('all')
    setCategoryFilter('all')
  }

  return (
    <div className="container">
      {/* Filters */}
      <div className="mb-8 space-y-3">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="documents-filter-year">
              Year
            </label>
            <select
              className={selectClasses}
              id="documents-filter-year"
              onChange={(event) => setYearFilter(event.target.value)}
              value={yearFilter}
            >
              <option value="all">All years</option>
              {years.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="documents-filter-category">
              Category
            </label>
            <select
              className={selectClasses}
              id="documents-filter-category"
              onChange={(event) => setCategoryFilter(event.target.value)}
              value={categoryFilter}
            >
              <option value="all">All categories</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          Showing {filtered.length} of {documents.length}{' '}
          {documents.length === 1 ? 'document' : 'documents'}
        </p>
      </div>

      {/* Rows */}
      {filtered.length > 0 ? (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card list-none p-0">
          {filtered.map((doc) => {
            const size = formatFileSize(doc.filesize)

            return (
              <li
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6"
                key={doc.id}
              >
                <div className="min-w-0">
                  <h3 className="font-display text-base font-bold">{doc.title}</h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{doc.year}</span>
                    <span aria-hidden>·</span>
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                      {doc.categoryLabel}
                    </span>
                  </div>
                  {doc.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{doc.description}</p>
                  )}
                </div>
                <a
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-brand px-6 font-medium text-brand-on transition-transform duration-150 hover:scale-[1.03] sm:self-center"
                  download
                  href={doc.url}
                >
                  Download PDF
                  {size && (
                    <span className="text-xs font-normal opacity-85">({size})</span>
                  )}
                </a>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="font-medium">No documents match those filters.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different year or category.</p>
          <button
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-border px-6 font-medium transition-colors duration-150 hover:border-foreground/40"
            onClick={clearFilters}
            type="button"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
