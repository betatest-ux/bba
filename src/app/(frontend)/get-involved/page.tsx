import type { Metadata } from 'next/types'

import type { Form as PluginFormType } from '@payloadcms/plugin-form-builder/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import { FormBlock } from '@/blocks/Form/Component'
import { Reveal } from '@/components/Motion/Reveal'
import { WeaveDivider } from '@/components/Weave'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function GetInvolvedPage() {
  const payload = await getPayload({ config: configPromise })

  const [volunteerRoles, volunteerForm] = await Promise.all([
    payload.find({
      collection: 'vacancies',
      depth: 0,
      limit: 12,
      overrideAccess: false,
      sort: 'closingDate',
      where: {
        and: [
          { vacancyType: { equals: 'voluntary' } },
          { _status: { equals: 'published' } },
          { closingDate: { greater_than: new Date().toISOString() } },
        ],
      },
    }),
    payload
      .find({
        collection: 'forms',
        limit: 1,
        where: { title: { equals: 'Volunteer interest form' } },
      })
      .then((result) => result.docs[0] ?? null),
  ])

  return (
    <div className="pt-16 pb-24">
      <PageClient />
      <header className="container mb-10">
        <p className="font-display text-sm font-bold uppercase tracking-wider text-brand">
          Get involved
        </p>
        <h1 className="mt-2 text-h1 max-w-2xl">There’s a place for you here</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Time, money or connections — every kind of help moves the work forward. Pick your way in.
        </p>
        <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2">
          <a className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:border-foreground/40" href="#volunteer">
            Volunteer
          </a>
          <a className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:border-foreground/40" href="#donate-section">
            Donate
          </a>
          <a className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:border-foreground/40" href="#partner">
            Partner with us
          </a>
        </nav>
      </header>

      {/* Volunteer */}
      <section aria-labelledby="volunteer-heading" className="container scroll-mt-24 pt-6" id="volunteer">
        <h2 className="text-h2" id="volunteer-heading">
          Volunteer
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          No experience needed — just a bit of time and a willingness to muck in. These roles are
          open right now:
        </p>

        {volunteerRoles.docs.length > 0 ? (
          <ul className="mt-8 grid gap-6 list-none p-0 md:grid-cols-2 lg:grid-cols-3">
            {volunteerRoles.docs.map((role, index) => (
              <Reveal as="li" delay={index * 0.05} key={role.id}>
                <Link
                  className="thread-top group block h-full rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
                  href={`/jobs/${role.slug}`}
                >
                  <span className="rounded-full bg-moor/15 px-3 py-1 text-xs font-semibold text-moor dark:bg-moor/30 dark:text-success">
                    Voluntary
                  </span>
                  <h3 className="mt-3 text-h3 group-hover:underline">{role.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">📍 {role.location}</p>
                  {role.hours && <p className="mt-1 text-sm text-muted-foreground">🕐 {role.hours}</p>}
                </Link>
              </Reveal>
            ))}
          </ul>
        ) : (
          <p className="mt-8 rounded-2xl border border-border bg-card p-8 text-muted-foreground">
            No listed roles at the moment — but we can nearly always find something for willing
            hands. Use the form below.
          </p>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          Looking for paid work instead? See{' '}
          <Link className="font-medium text-brand underline" href="/jobs">
            Work with us
          </Link>
          .
        </p>

        {volunteerForm && (
          <div className="mt-12 max-w-2xl rounded-3xl border border-border bg-card p-8">
            <h3 className="text-h3 mb-2">Register your interest</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Tell us what you’d enjoy and how much time you have — our volunteer coordinator will
              be in touch within a week.
            </p>
            <FormBlock enableIntro={false} form={volunteerForm as unknown as PluginFormType} />
          </div>
        )}
      </section>

      <WeaveDivider className="my-16" />

      {/* Donate */}
      <section aria-labelledby="donate-heading" className="container scroll-mt-24" id="donate-section">
        <div className="rounded-3xl bg-brand-soft p-8 md:p-12">
          <h2 className="text-h2" id="donate-heading">
            Give money
          </h2>
          <p className="mt-3 max-w-2xl">
            Every pound stays close to home — the pantry, the youth clubs, the elders’ groups — plus
            trusted partner projects further afield. UK taxpayers can add 25% with Gift Aid at no
            extra cost.
          </p>
          <Link
            className="mt-6 inline-flex h-12 items-center rounded-full bg-brand px-8 font-semibold text-brand-on transition-transform duration-150 hover:scale-[1.03]"
            href="/donate"
          >
            Donate
          </Link>
        </div>
      </section>

      <WeaveDivider className="my-16" />

      {/* Partner */}
      <section aria-labelledby="partner-heading" className="container scroll-mt-24" id="partner">
        <h2 className="text-h2" id="partner-heading">
          Partner with us
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Local businesses, mosques, churches, schools and community groups make our work possible.
          Ways partners help include:
        </p>
        <ul className="mt-6 grid max-w-2xl gap-3 list-none p-0">
          {[
            'Sponsoring a project for a season — e.g. a youth club term or a month of the pantry [PLACEHOLDER — real examples]',
            'Staff volunteering days for teams [PLACEHOLDER — real examples]',
            'Donating goods, venues or professional skills [PLACEHOLDER — real examples]',
            'Matched giving and payroll giving schemes [PLACEHOLDER — real examples]',
          ].map((item) => (
            <li className="flex items-start gap-3" key={item}>
              <span aria-hidden className="mt-2 h-2 w-6 shrink-0 rounded-full bg-brand" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Link
          className="mt-8 inline-flex h-12 items-center rounded-full border-2 border-foreground/25 px-8 font-semibold transition-colors hover:border-foreground/60"
          href="/contact"
        >
          Start a conversation
        </Link>
      </section>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    description: 'Volunteer, donate or partner with BBAlliance in Blackburn and Darwen.',
    title: 'Get Involved | BBAlliance',
  }
}
