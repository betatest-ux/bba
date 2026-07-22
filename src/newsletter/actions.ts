'use server'

import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { z } from 'zod'

import { rateLimit } from '@/utilities/rateLimit'
import { getServerSideURL } from '@/utilities/getURL'

export type NewsletterActionResult = { message: string; ok: false } | { ok: true }

const schema = z.object({
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Please tick the consent box.' }),
  }),
  email: z.string().trim().email('Enter a valid email address.'),
})

export const subscribeToNewsletter = async (
  _previous: NewsletterActionResult | null,
  formData: FormData,
): Promise<NewsletterActionResult> => {
  // Honeypot — bots fill it; pretend success.
  if (String(formData.get('website') ?? '')) return { ok: true }

  const parsed = schema.safeParse({
    consent: formData.get('consent') === 'on' || formData.get('consent') === 'true',
    email: String(formData.get('email') ?? ''),
  })
  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? 'Check your details.', ok: false }
  }

  const headerList = await headers()
  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerList.get('x-real-ip') ||
    'unknown'
  const limited = rateLimit(`newsletter:${ip}`)
  if (!limited.ok) {
    return { message: 'Too many sign-ups from this connection — try again shortly.', ok: false }
  }

  const payload = await getPayload({ config: configPromise })
  const email = parsed.data.email.toLowerCase()

  try {
    const existing = await payload.find({
      collection: 'newsletter-subscribers',
      limit: 1,
      where: { email: { equals: email } },
    })

    let subscriber = existing.docs[0] ?? null

    // Already confirmed: succeed quietly (never reveal subscription state).
    if (subscriber?.confirmed) return { ok: true }

    if (!subscriber) {
      subscriber = await payload.create({
        collection: 'newsletter-subscribers',
        data: {
          consentAt: new Date().toISOString(),
          confirmed: false,
          email,
        },
      })
    }

    const token = subscriber.unsubscribeToken
    if (token) {
      const emailSettings = await payload.findGlobal({ slug: 'email-settings' }).catch(() => null)
      const confirmUrl = `${getServerSideURL()}/newsletter/confirm?token=${token}`

      await payload
        .sendEmail({
          from: emailSettings?.fromEmail
            ? `"${emailSettings.fromName ?? 'BBAlliance'}" <${emailSettings.fromEmail}>`
            : undefined,
          html: [
            '<p>Hello,</p>',
            '<p>Please confirm you’d like the BBAlliance newsletter by clicking the link below:</p>',
            `<p><a href="${confirmUrl}">Confirm my subscription</a></p>`,
            '<p>If this wasn’t you, just ignore this email — nothing will be sent.</p>',
            '<p>BBAlliance — Blackburn &amp; Darwen</p>',
          ].join('\n'),
          subject: 'Confirm your BBAlliance newsletter signup',
          to: email,
        })
        .catch((error) => {
          payload.logger.error({ err: error, msg: 'Newsletter confirmation email failed' })
        })
    }

    return { ok: true }
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Newsletter subscribe failed' })
    return { message: 'Something went wrong — please try again.', ok: false }
  }
}
