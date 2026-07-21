'use client'

import React, { useEffect, useRef, useState } from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { ChevronDown, SearchIcon } from 'lucide-react'
import { cn } from '@/utilities/ui'

type NavItem = NonNullable<HeaderType['navItems']>[number]

const Dropdown: React.FC<{ item: NavItem }> = ({ item }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLLIElement>(null)

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <li
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      ref={ref}
    >
      <button
        aria-expanded={open}
        aria-haspopup="true"
        className="flex min-h-11 items-center gap-1 font-medium transition-colors hover:text-brand"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {item.link.label}
        <ChevronDown
          aria-hidden
          className={cn('transition-transform duration-200', open && 'rotate-180')}
          size={16}
        />
      </button>
      <ul
        className={cn(
          'absolute left-1/2 top-full z-50 min-w-52 -translate-x-1/2 rounded-xl border border-border bg-popover p-2 shadow-lg transition-all duration-200 list-none',
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-1 opacity-0',
        )}
      >
        {(item.children || []).map((child, index) => (
          <li key={index}>
            <CMSLink
              className="block rounded-lg px-4 py-2.5 font-medium transition-colors hover:bg-secondary"
              {...child.link}
              appearance="inline"
            />
          </li>
        ))}
      </ul>
    </li>
  )
}

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav aria-label="Main menu" className="hidden items-center gap-6 lg:flex">
      <ul className="flex items-center gap-6 list-none">
        {navItems.map((item, index) => {
          if (item.highlight) {
            return (
              <li key={index}>
                <CMSLink
                  className="inline-flex h-11 items-center rounded-full bg-brand px-6 font-semibold text-brand-on transition-transform duration-150 hover:scale-[1.04] active:scale-[0.98]"
                  {...item.link}
                  appearance="inline"
                />
              </li>
            )
          }

          if (item.children && item.children.length > 0) {
            return <Dropdown item={item} key={index} />
          }

          return (
            <li key={index}>
              <CMSLink
                className="flex min-h-11 items-center font-medium transition-colors hover:text-brand"
                {...item.link}
                appearance="inline"
              />
            </li>
          )
        })}
      </ul>
      <Link
        aria-label="Search this site"
        className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-secondary"
        href="/search"
      >
        <SearchIcon aria-hidden className="w-5" />
      </Link>
    </nav>
  )
}
