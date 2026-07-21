'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, SearchIcon, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

/**
 * Full-screen mobile menu: fast, staggered entrance, Esc/route-change close,
 * body scroll locked while open.
 */
export const MobileNav: React.FC<{ data: HeaderType; siteName: string }> = ({ data }) => {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const navItems = data?.navItems || []

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) closeButtonRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        aria-expanded={open}
        aria-label="Open menu"
        className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-secondary"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Menu aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            animate={{ opacity: 1 }}
            aria-label="Site menu"
            aria-modal="true"
            className="fixed inset-0 z-50 flex flex-col bg-background"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            role="dialog"
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
          >
            <div className="container flex items-center justify-between py-4">
              <p className="font-display text-lg font-bold">Menu</p>
              <button
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-secondary"
                onClick={() => setOpen(false)}
                ref={closeButtonRef}
                type="button"
              >
                <X aria-hidden />
              </button>
            </div>

            <nav aria-label="Mobile menu" className="container flex-1 overflow-y-auto pb-10">
              <ul className="space-y-1 list-none">
                {navItems.map((item, index) => (
                  <motion.li
                    animate={{ opacity: 1, y: 0 }}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    key={index}
                    transition={{
                      delay: reduceMotion ? 0 : 0.04 * index,
                      duration: reduceMotion ? 0.1 : 0.25,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {item.highlight ? (
                      <CMSLink
                        className="mt-4 inline-flex h-12 items-center rounded-full bg-brand px-8 text-lg font-semibold text-brand-on"
                        {...item.link}
                        appearance="inline"
                      />
                    ) : (
                      <CMSLink
                        className="block rounded-xl px-3 py-3 font-display text-2xl font-bold transition-colors hover:bg-secondary"
                        {...item.link}
                        appearance="inline"
                      />
                    )}
                    {item.children && item.children.length > 0 && (
                      <ul className="mb-2 ml-4 border-l-2 border-brand/30 pl-4 list-none">
                        {item.children.map((child, childIndex) => (
                          <li key={childIndex}>
                            <CMSLink
                              className="block px-2 py-2.5 text-lg text-muted-foreground transition-colors hover:text-foreground"
                              {...child.link}
                              appearance="inline"
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.li>
                ))}
                <motion.li
                  animate={{ opacity: 1, y: 0 }}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                  transition={{ delay: reduceMotion ? 0 : 0.04 * navItems.length, duration: 0.25 }}
                >
                  <Link
                    className="mt-2 flex items-center gap-2 rounded-xl px-3 py-3 text-lg font-medium transition-colors hover:bg-secondary"
                    href="/search"
                  >
                    <SearchIcon aria-hidden size={20} /> Search
                  </Link>
                </motion.li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
