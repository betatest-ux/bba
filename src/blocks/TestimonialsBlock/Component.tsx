import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { Testimonial, TestimonialsBlockType } from '@/payload-types'

import { Media } from '@/components/Media'
import { Reveal } from '@/components/Motion/Reveal'

export const TestimonialsBlock: React.FC<TestimonialsBlockType> = async ({
  heading,
  limit,
  populateBy,
  testimonials: selected,
}) => {
  let testimonials: Testimonial[] = []

  if (populateBy === 'selection' && selected?.length) {
    testimonials = selected.filter(
      (testimonial): testimonial is Testimonial => typeof testimonial === 'object',
    )
  } else {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'testimonials',
      limit: limit ?? 3,
      overrideAccess: false,
      sort: '-createdAt',
    })
    testimonials = result.docs
  }

  if (testimonials.length === 0) return null

  return (
    <section className="py-14 md:py-20">
      <div className="container">
        {heading && (
          <Reveal>
            <h2 className="text-h2 mb-10 text-center">{heading}</h2>
          </Reveal>
        )}
        <ul className="grid gap-6 md:grid-cols-3 list-none p-0">
          {testimonials.map((testimonial, index) => (
            <Reveal as="li" delay={index * 0.07} key={testimonial.id}>
              <figure className="thread-top flex h-full flex-col rounded-2xl border border-border bg-card p-7">
                <svg aria-hidden className="mb-4 h-6 w-8 text-brand" fill="currentColor" viewBox="0 0 32 24">
                  <path d="M0 24V14.4C0 6.5 4.8 1.6 12.8 0l1.6 4.8C9.6 6.4 7.2 9 7.2 12H14v12H0Zm18 0V14.4C18 6.5 22.8 1.6 30.8 0l1.2 4.8C27.6 6.4 25.2 9 25.2 12H32v12H18Z" />
                </svg>
                <blockquote className="flex-1 text-lg leading-relaxed">{testimonial.quote}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  {testimonial.photo && typeof testimonial.photo === 'object' && (
                    <div className="h-11 w-11 overflow-hidden rounded-full">
                      <Media imgClassName="h-full w-full object-cover" resource={testimonial.photo} size="44px" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    {testimonial.context && (
                      <p className="text-sm text-muted-foreground">{testimonial.context}</p>
                    )}
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
