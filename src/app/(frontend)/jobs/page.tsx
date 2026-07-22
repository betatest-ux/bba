import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { Reveal } from '@/components/Motion/Reveal'
import { cn } from '@/utilities/ui'
import { CountdownBadge } from './CountdownBadge'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

type VacancyCard = {
  closingDate: string
  hours?: string | null
  id: number
  location: string
  salary?: string | null
  slug: string
  title: string
  vacancyType: 'paid' | 'voluntary'
}

const formatClosingDate = (value: string): string =>
  new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const VacancyListItem: React.FC<{ index: number; vacancy: VacancyCard }> = ({ index, vacancy }) => (
  <Reveal as="li" delay={(index % 3) * 0.06}>
    <Link
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-shadow duration-300 hover:shadow-lg"
      href={`/jobs/${vacancy.slug}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold',
            vacancy.vacancyType === 'paid' ? 'bg-brand-soft' : 'bg-moor/15 text-moor',
          )}
        >
          {vacancy.vacancyType === 'paid' ? 'Paid' : 'Voluntary'}
        </span>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
          {vacancy.location}
        </span>
      </div>

      <h3 className="mt-4 text-h3 group-hover:underline">{vacancy.title}</h3>

      <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
        {vacancy.hours && (
          <div className="flex gap-2">
            <dt className="font-medium text-foreground">Hours:</dt>
            <dd>{vacancy.hours}</dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt className="font-medium text-foreground">
            {vacancy.vacancyType === 'paid' ? 'Salary:' : 'Role:'}
          </dt>
          <dd>{vacancy.salary || 'Voluntary'}</dd>
        </div>
      </dl>

      <p className="mt-auto flex flex-wrap items-center gap-2 pt-5 text-sm text-muted-foreground">
        <span>Closes {formatClosingDate(vacancy.closingDate)}</span>
        <CountdownBadge closingDate={vacancy.closingDate} />
      </p>
    </Link>
  </Reveal>
)

export default async function JobsPage() {
  const payload = await getPayload({ config: configPromise })

  const vacancies = await payload.find({
    collection: 'vacancies',
    limit: 100,
    overrideAccess: false,
    select: {
      closingDate: true,
      hours: true,
      location: true,
      salary: true,
      slug: true,
      title: true,
      vacancyType: true,
    },
    sort: 'closingDate',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { closingDate: { greater_than: new Date().toISOString() } },
      ],
    },
  })

  const cards: VacancyCard[] = vacancies.docs.map((vacancy) => ({
    closingDate: vacancy.closingDate,
    hours: vacancy.hours,
    id: vacancy.id,
    location: vacancy.location,
    salary: vacancy.salary,
    slug: vacancy.slug ?? '',
    title: vacancy.title,
    vacancyType: vacancy.vacancyType,
  }))

  const paidRoles = cards.filter((vacancy) => vacancy.vacancyType === 'paid')
  const volunteerRoles = cards.filter((vacancy) => vacancy.vacancyType === 'voluntary')

  return (
    <div className="pt-16 pb-24">
      <PageClient />
      <header className="container mb-10">
        <p className="font-display text-sm font-bold uppercase tracking-wider text-brand">
          Work with us
        </p>
        <h1 className="mt-2 text-h1 max-w-2xl">Help us weave something good</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Paid roles and volunteer roles, all based in and around Blackburn with Darwen. Every one
          comes with a friendly team and a proper cup of tea.
        </p>
      </header>

      {cards.length === 0 ? (
        <div className="container">
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <h2 className="text-h3">No open roles right now</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Follow us or check back soon — new roles are posted here first. In the meantime,
              there are plenty of other ways to lend a hand.
            </p>
            <Link
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 font-medium text-brand-on transition-transform duration-150 hover:scale-[1.03]"
              href="/get-involved"
            >
              Ways to get involved
            </Link>
          </div>
        </div>
      ) : (
        <div className="container space-y-14">
          {paidRoles.length > 0 && (
            <section aria-labelledby="paid-roles">
              <h2 className="text-h2 mb-6" id="paid-roles">
                Paid roles
              </h2>
              <ul className="grid gap-6 list-none p-0 md:grid-cols-2 lg:grid-cols-3">
                {paidRoles.map((vacancy, index) => (
                  <VacancyListItem index={index} key={vacancy.id} vacancy={vacancy} />
                ))}
              </ul>
            </section>
          )}

          {volunteerRoles.length > 0 && (
            <section aria-labelledby="volunteer-roles">
              <h2 className="text-h2 mb-6" id="volunteer-roles">
                Volunteer roles
              </h2>
              <ul className="grid gap-6 list-none p-0 md:grid-cols-2 lg:grid-cols-3">
                {volunteerRoles.map((vacancy, index) => (
                  <VacancyListItem index={index} key={vacancy.id} vacancy={vacancy} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    description:
      'Current paid and volunteer roles at BBAlliance in Blackburn with Darwen — come and work with us.',
    title: 'Work With Us | BBAlliance',
  }
}
