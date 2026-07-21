'use server'

import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { contactSchema, contactSubjectLabels } from '@/forms/contactSchema'
import { rateLimit } from '@/utilities/rateLimit'

export type ContactActionResult =
  | { fieldErrors?: Record<string, string>; message: string; ok: false }
  | { ok: true }

export const submitContactForm = async (
  _previous: ContactActionResult | null,
  formData: FormData,
): Promise<ContactActionResult> => {
  const raw = {
    consent: formData.get('consent') === 'on' || formData.get('consent') === 'true',
    email: String(formData.get('email') ?? ''),
    message: String(formData.get('message') ?? ''),
    name: String(formData.get('name') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    subject: String(formData.get('subject') ?? ''),
    website: String(formData.get('website') ?? ''),
  }

  // Honeypot: bots fill the hidden field. Pretend success, store nothing.
  if (raw.website) return { ok: true }

  const parsed = contactSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return {
      fieldErrors,
      message: 'Please fix the highlighted fields and try again.',
      ok: false,
    }
  }

  // Rate limit per IP: 5 messages per 10 minutes.
  const headerList = await headers()
  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerList.get('x-real-ip') ||
    'unknown'
  const limited = rateLimit(`contact:${ip}`)
  if (!limited.ok) {
    return {
      message: `That’s a few messages in a short time — please try again in ${Math.ceil(limited.retryAfterSeconds / 60)} minute(s).`,
      ok: false,
    }
  }

  const payload = await getPayload({ config: configPromise })
  const data = parsed.data

  try {
    // Store in the same inbox as form-builder submissions.
    const forms = await payload.find({
      collection: 'forms',
      limit: 1,
      where: { title: { equals: 'Contact form' } },
    })
    const form = forms.docs[0]

    if (form) {
      await payload.create({
        collection: 'form-submissions',
        data: {
          form: form.id,
          submissionData: [
            { field: 'name', value: data.name },
            { field: 'email', value: data.email },
            { field: 'phone', value: data.phone || '' },
            { field: 'subject', value: data.subject },
            { field: 'message', value: data.message },
            { field: 'consent', value: 'yes' },
          ],
        },
      })
    }

    // Notify the configured recipients.
    const emailSettings = await payload.findGlobal({ slug: 'email-settings' }).catch(() => null)
    const recipients = (emailSettings?.contactRecipients ?? [])
      .map((recipient) => recipient.email)
      .filter(Boolean)

    if (recipients.length > 0) {
      await payload
        .sendEmail({
          from: emailSettings?.fromEmail
            ? `"${emailSettings.fromName ?? 'BBAlliance'}" <${emailSettings.fromEmail}>`
            : undefined,
          html: [
            `<p><strong>From:</strong> ${escapeHTML(data.name)} &lt;${escapeHTML(data.email)}&gt;</p>`,
            data.phone ? `<p><strong>Phone:</strong> ${escapeHTML(data.phone)}</p>` : '',
            `<p><strong>Subject:</strong> ${contactSubjectLabels[data.subject]}</p>`,
            `<p><strong>Message:</strong></p>`,
            `<p>${escapeHTML(data.message).replace(/\n/g, '<br />')}</p>`,
          ].join('\n'),
          subject: `New enquiry (${contactSubjectLabels[data.subject]}) — bballiance.org.uk`,
          to: recipients.join(', '),
        })
        .catch((error) => {
          payload.logger.error({ err: error, msg: 'Contact email failed to send' })
        })
    }

    return { ok: true }
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Contact form submission failed' })
    return {
      message: 'Something went wrong at our end — please try again, or email us directly.',
      ok: false,
    }
  }
}

const escapeHTML = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
