import type { Metadata } from 'next/types'

import React from 'react'

import { MapLoader } from '@/blocks/MapBlock/MapLoader'
import { SocialIcon, type SocialPlatform } from '@/components/SocialIcon'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { ContactForm } from './ContactForm'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function ContactPage() {
  const contact = await getCachedGlobal('contact-settings', 0)().catch(() => null)

  return (
    <div className="pt-16 pb-24">
      <header className="container mb-12">
        <p className="font-display text-sm font-bold uppercase tracking-wider text-brand">Contact</p>
        <h1 className="mt-2 text-h1">Say hello</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Whether you want to volunteer, need a hand, or just have a question — we’d love to hear
          from you.
        </p>
      </header>

      <div className="container grid gap-12 lg:grid-cols-[1fr_360px]">
        <section aria-label="Contact form">
          <ContactForm />
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold">Visit or write</h2>
            {contact?.address && (
              <p className="mt-3 whitespace-pre-line text-muted-foreground">{contact.address}</p>
            )}
            {contact?.email && (
              <p className="mt-3">
                <a className="font-medium text-brand underline" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              </p>
            )}
            {contact?.phone && <p className="mt-1 font-medium">{contact.phone}</p>}
          </div>

          {contact?.officeHours && contact.officeHours.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-bold">Office hours</h2>
              <dl className="mt-3 space-y-1.5">
                {contact.officeHours.map((row, index) => (
                  <div className="flex justify-between gap-4 text-sm" key={row.id ?? index}>
                    <dt className="text-muted-foreground">{row.days}</dt>
                    <dd className="font-medium">{row.hours}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {contact?.socialLinks && contact.socialLinks.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-bold">Follow along</h2>
              <ul className="mt-3 flex gap-3 list-none p-0" aria-label="Social media">
                {contact.socialLinks.map((social, index) => (
                  <li key={social.id ?? index}>
                    <a
                      aria-label={`BBAlliance on ${social.platform}`}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary"
                      href={social.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <SocialIcon platform={social.platform as SocialPlatform} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <section aria-label="Map" className="container mt-14">
        <MapLoader
          address={contact?.address ?? undefined}
          lat={contact?.latitude ?? 53.7486}
          lng={contact?.longitude ?? -2.4842}
          zoom={contact?.mapZoom ?? 15}
        />
      </section>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    description:
      'Contact BBAlliance — volunteer, ask a question, or find our office in Blackburn.',
    title: 'Contact | BBAlliance',
  }
}
