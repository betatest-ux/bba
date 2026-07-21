'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { cn } from '@/utilities/ui'
import { HeaderNav } from './Nav'
import { MobileNav } from './Nav/MobileNav'

interface HeaderClientProps {
  data: Header
  logoDark?: string | null
  logoLight?: string | null
  siteName: string
}

export const HeaderClient: React.FC<HeaderClientProps> = ({
  data,
  logoDark,
  logoLight,
  siteName,
}) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const [condensed, setCondensed] = useState(false)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  // Sticky header condenses after 80px of scroll.
  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-all duration-300',
        condensed
          ? 'border-border bg-background/95 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/85'
          : 'border-transparent bg-background',
      )}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div
        className={cn(
          'container flex items-center justify-between gap-4 transition-all duration-300',
          condensed ? 'py-3' : 'py-5 md:py-6',
        )}
      >
        <Link aria-label={`${siteName} — home`} className="shrink-0" href="/">
          <Logo
            loading="eager"
            logoUrl={theme === 'dark' ? logoDark || logoLight : logoLight}
            priority="high"
            siteName={siteName}
          />
        </Link>
        <HeaderNav data={data} />
        <MobileNav data={data} siteName={siteName} />
      </div>
    </header>
  )
}
