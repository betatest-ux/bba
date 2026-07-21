import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { FAQAccordionBlock as FAQAccordionBlockProps, Faq } from '@/payload-types'

import { Reveal } from '@/components/Motion/Reveal'
import RichText from '@/components/RichText'
import { ChevronDown } from 'lucide-react'

type Item = { answer: Faq['answer']; id: string; question: string }

export const FAQAccordionBlock: React.FC<FAQAccordionBlockProps> = async ({
  category,
  faqs,
  heading,
  items: manualItems,
  populateBy,
}) => {
  let items: Item[] = []

  if (populateBy === 'manual' && manualItems?.length) {
    items = manualItems.map((item, index) => ({
      answer: item.answer,
      id: String(item.id ?? index),
      question: item.question,
    }))
  } else if (populateBy === 'selection' && faqs?.length) {
    items = faqs
      .filter((faq): faq is Faq => typeof faq === 'object' && faq !== null)
      .map((faq) => ({ answer: faq.answer, id: String(faq.id), question: faq.question }))
  } else {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'faqs',
      limit: 20,
      overrideAccess: false,
      sort: 'displayOrder',
      ...(category ? { where: { category: { equals: category } } } : {}),
    })
    items = result.docs.map((faq) => ({
      answer: faq.answer,
      id: String(faq.id),
      question: faq.question,
    }))
  }

  if (items.length === 0) return null

  return (
    <section className="py-14 md:py-20">
      <div className="container max-w-3xl">
        {heading && (
          <Reveal>
            <h2 className="text-h2 mb-8">{heading}</h2>
          </Reveal>
        )}
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {items.map((item) => (
            <details className="group px-6 py-4 open:pb-6" key={item.id}>
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-medium marker:hidden [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <ChevronDown
                  aria-hidden
                  className="shrink-0 text-brand transition-transform duration-200 group-open:rotate-180"
                  size={20}
                />
              </summary>
              <div className="pt-2 text-muted-foreground">
                <RichText data={item.answer} enableGutter={false} enableProse={true} />
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
