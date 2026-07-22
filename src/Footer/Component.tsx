import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer as FooterType } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { SocialIcon, type SocialPlatform } from '@/components/SocialIcon'
import { Weave } from '@/components/Weave'

export async function Footer() {
  const [footerData, siteSettings, contactSettings] = await Promise.all([
    getCachedGlobal('footer', 1)() as Promise<FooterType>,
    getCachedGlobal('site-settings', 0)().catch(() => null),
    getCachedGlobal('contact-settings', 0)().catch(() => null),
  ])

  const columns = footerData?.columns || []
  const legalLinks = footerData?.legalLinks || []
  const socials = contactSettings?.socialLinks || []

  return (
    <footer className="mt-auto bg-loom text-white">
      <div className="container pt-14 pb-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr]">
          {/* Identity */}
          <div>
            <Link className="inline-flex items-center" href="/">
              <Logo loading="lazy" priority="low" />
            </Link>
            {siteSettings?.strapline && (
              <p className="mt-4 max-w-xs text-white/80">{siteSettings.strapline}</p>
            )}
            <Weave className="mt-6 h-5 w-32 text-white/40" />
          </div>

          {/* Link columns */}
          {columns.map((column, index) => (
            <nav aria-label={column.title} key={index}>
              <h2 className="font-display text-sm uppercase tracking-wider text-white/60 mb-4">
                {column.title}
              </h2>
              <ul className="space-y-2">
                {(column.links || []).map(({ link }, linkIndex) => (
                  <li key={linkIndex}>
                    <CMSLink
                      className="text-white/90 hover:text-white transition-colors"
                      {...link}
                      appearance="inline"
                    />
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Contact block */}
          <div>
            <h2 className="font-display text-sm uppercase tracking-wider text-white/60 mb-4">
              Find us
            </h2>
            {contactSettings?.address && (
              <p className="whitespace-pre-line text-white/90">{contactSettings.address}</p>
            )}
            {contactSettings?.email && (
              <p className="mt-3">
                <a
                  className="underline text-white/90 hover:text-white"
                  href={`mailto:${contactSettings.email}`}
                >
                  {contactSettings.email}
                </a>
              </p>
            )}
            {contactSettings?.phone && <p className="mt-1 text-white/90">{contactSettings.phone}</p>}

            {socials.length > 0 && (
              <ul className="mt-5 flex gap-3" aria-label="Social media">
                {socials.map((social, index) => (
                  <li key={index}>
                    <a
                      aria-label={`BBAlliance on ${social.platform}`}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                      href={social.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <SocialIcon platform={social.platform as SocialPlatform} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Newsletter */}
        {footerData?.newsletterEnabled && (
          <div className="mt-12 max-w-md">
            <h2 className="font-display text-sm uppercase tracking-wider text-white/60 mb-3">
              {footerData?.newsletterHeading || 'Stay in the loop'}
            </h2>
            <NewsletterSignup variant="footer" />
          </div>
        )}

        {/* Legal line */}
        <div className="mt-12 border-t border-white/15 pt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between text-sm text-white/70">
          <div>
            <p>{siteSettings?.charityNumber || 'Registered Charity No. [PENDING]'}</p>
            {siteSettings?.organisationLine && (
              <p className="mt-1">{siteSettings.organisationLine}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legalLinks.map(({ link }, index) => (
              <CMSLink
                className="text-white/70 hover:text-white transition-colors"
                key={index}
                {...link}
                appearance="inline"
              />
            ))}
            <ThemeSelector />
          </div>
        </div>
      </div>
    </footer>
  )
}
