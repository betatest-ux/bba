'use client'

import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import RichText from '@/components/RichText'
import { Reveal } from '@/components/Motion/Reveal'
import { getMediaUrl } from '@/utilities/getMediaUrl'

export type PersonCard = {
  bio: DefaultTypedEditorState | null
  email: string | null
  id: number | string
  image: { alt: string; url: string } | null
  name: string
  role: string
}

/**
 * Grouped people grid (Trustees → Staff → Volunteers) with accessible bio
 * modals: native <dialog> gives us focus trapping and Esc-to-close for free;
 * we add backdrop-click close and focus restoration.
 */
export const PeopleGrid: React.FC<{ groups: { people: PersonCard[]; title: string }[] }> = ({
  groups,
}) => {
  const [active, setActive] = useState<PersonCard | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (active && !dialog.open) dialog.showModal()
    if (!active && dialog.open) dialog.close()
  }, [active])

  const close = () => {
    setActive(null)
    if (triggerRef.current) triggerRef.current.focus()
  }

  return (
    <div className="container mt-8 space-y-16">
      {groups.map(
        (group) =>
          group.people.length > 0 && (
            <section aria-labelledby={`group-${group.title}`} key={group.title}>
              <h2 className="text-h2 mb-8" id={`group-${group.title}`}>
                {group.title}
              </h2>
              <ul className="grid grid-cols-2 gap-6 list-none p-0 md:grid-cols-3 lg:grid-cols-4">
                {group.people.map((person, index) => (
                  <Reveal as="li" delay={(index % 4) * 0.05} key={person.id}>
                    <button
                      className="thread-top group block w-full overflow-hidden rounded-2xl border border-border bg-card text-left transition-shadow duration-200 hover:shadow-lg"
                      onClick={(event) => {
                        triggerRef.current = event.currentTarget
                        setActive(person)
                      }}
                      type="button"
                    >
                      <div className="relative aspect-4/5 overflow-hidden bg-secondary">
                        {person.image && (
                          <Image
                            alt={person.image.alt}
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            src={getMediaUrl(person.image.url)}
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-display font-bold leading-tight">{person.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{person.role}</p>
                        <p className="mt-2 text-sm font-medium text-brand">Read bio →</p>
                      </div>
                    </button>
                  </Reveal>
                ))}
              </ul>
            </section>
          ),
      )}

      <dialog
        aria-label={active ? `About ${active.name}` : undefined}
        className="m-auto w-[min(92vw,540px)] rounded-2xl border border-border bg-card p-0 text-foreground shadow-xl backdrop:bg-black/50"
        onClick={(event) => {
          // Click on the backdrop (the dialog element itself) closes.
          if (event.target === dialogRef.current) close()
        }}
        onClose={close}
        ref={dialogRef}
      >
        {active && (
          <div className="p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {active.image && (
                  <Image
                    alt=""
                    className="h-16 w-16 rounded-full object-cover"
                    height={64}
                    src={getMediaUrl(active.image.url)}
                    width={64}
                  />
                )}
                <div>
                  <h3 className="font-display text-xl font-bold">{active.name}</h3>
                  <p className="text-sm text-muted-foreground">{active.role}</p>
                </div>
              </div>
              <button
                aria-label="Close"
                autoFocus
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-secondary"
                onClick={close}
                type="button"
              >
                ✕
              </button>
            </div>
            {active.bio && (
              <div className="mt-5 text-muted-foreground">
                <RichText data={active.bio} enableGutter={false} />
              </div>
            )}
            {active.email && (
              <p className="mt-5">
                <a className="font-medium text-brand underline" href={`mailto:${active.email}`}>
                  {active.email}
                </a>
              </p>
            )}
          </div>
        )}
      </dialog>
    </div>
  )
}
