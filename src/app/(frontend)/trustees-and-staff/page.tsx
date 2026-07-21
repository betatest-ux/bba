import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { PeopleGrid, type PersonCard } from './PeopleGrid'

export const dynamic = 'force-static'
export const revalidate = 600

const serialisePerson = (person: {
  bio?: unknown
  email?: string | null
  id: number | string
  name: string
  photo?: unknown
  role: string
}): PersonCard => ({
  bio: (person.bio as PersonCard['bio']) ?? null,
  email: person.email ?? null,
  id: person.id,
  image:
    person.photo && typeof person.photo === 'object'
      ? {
          alt: ((person.photo as { alt?: string }).alt ?? person.name) || person.name,
          url:
            (person.photo as { sizes?: { small?: { url?: string } }; url?: string }).sizes?.small
              ?.url ??
            (person.photo as { url?: string }).url ??
            '',
        }
      : null,
  name: person.name,
  role: person.role,
})

export default async function TrusteesPage() {
  const payload = await getPayload({ config: configPromise })

  const [people, page] = await Promise.all([
    payload.find({
      collection: 'people',
      limit: 200,
      overrideAccess: false,
      sort: 'displayOrder',
    }),
    payload
      .find({
        collection: 'pages',
        limit: 1,
        overrideAccess: false,
        where: { slug: { equals: 'trustees-and-staff' } },
      })
      .then((result) => result.docs[0] ?? null),
  ])

  const groups = (['trustee', 'staff', 'volunteer'] as const).map((personType) => ({
    people: people.docs
      .filter((person) => person.personType === personType)
      .map(serialisePerson),
    title:
      personType === 'trustee' ? 'Trustees' : personType === 'staff' ? 'Staff' : 'Volunteers',
  }))

  return (
    <div className="pb-24">
      {/* Editable intro — comes from the “Trustees & Staff” page in the CMS */}
      {page ? (
        <>
          <RenderHero {...page.hero} />
          <RenderBlocks blocks={page.layout} />
        </>
      ) : (
        <header className="container pt-16 pb-4">
          <h1 className="text-h1">Trustees &amp; staff</h1>
        </header>
      )}

      <PeopleGrid groups={groups} />
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    description: 'Meet the trustees, staff and volunteers behind BBAlliance.',
    title: 'Trustees & Staff | BBAlliance',
  }
}
