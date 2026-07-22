'use server'

import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { applicationSchema } from '@/forms/applicationSchema'
import { rateLimit } from '@/utilities/rateLimit'

export type ApplicationActionResult =
  | { fieldErrors?: Record<string, string>; message: string; ok: false }
  | { ok: true }

const MAX_CV_BYTES = 5 * 1024 * 1024 // 5MB

const ALLOWED_CV_MIMETYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

const EXTENSION_MIMETYPES: Record<string, (typeof ALLOWED_CV_MIMETYPES)[number]> = {
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pdf': 'application/pdf',
}

export const submitApplication = async (
  _previous: ApplicationActionResult | null,
  formData: FormData,
): Promise<ApplicationActionResult> => {
  const raw = {
    consent: formData.get('consent') === 'on' || formData.get('consent') === 'true',
    coverNote: String(formData.get('coverNote') ?? ''),
    email: String(formData.get('email') ?? ''),
    name: String(formData.get('name') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    website: String(formData.get('website') ?? ''),
  }

  // Honeypot: bots fill the hidden field. Pretend success, store nothing.
  if (raw.website) return { ok: true }

  const parsed = applicationSchema.safeParse(raw)
  const fieldErrors: Record<string, string> = {}
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
  }

  // The CV travels outside the zod schema — validate it by hand.
  const file = formData.get('cv')
  let cvMimetype: (typeof ALLOWED_CV_MIMETYPES)[number] | null = null
  if (!(file instanceof File) || file.size === 0) {
    fieldErrors.cv = 'Attach your CV as a PDF or Word document.'
  } else if (file.size > MAX_CV_BYTES) {
    fieldErrors.cv = 'That file is too big — please keep your CV under 5MB.'
  } else {
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    const byType = ALLOWED_CV_MIMETYPES.find((mimetype) => mimetype === file.type)
    cvMimetype = byType ?? EXTENSION_MIMETYPES[extension] ?? null
    if (!cvMimetype) {
      fieldErrors.cv = 'We can only accept PDF or Word documents (.pdf, .doc, .docx).'
    }
  }

  if (!parsed.success || !cvMimetype || !(file instanceof File)) {
    return {
      fieldErrors,
      message: 'Please fix the highlighted fields and try again.',
      ok: false,
    }
  }

  // Rate limit per IP: 3 applications per 10 minutes.
  const headerList = await headers()
  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerList.get('x-real-ip') ||
    'unknown'
  const limited = rateLimit(`apply:${ip}`, { max: 3 })
  if (!limited.ok) {
    return {
      message: `That’s a few applications in a short time — please try again in ${Math.ceil(limited.retryAfterSeconds / 60)} minute(s).`,
      ok: false,
    }
  }

  const payload = await getPayload({ config: configPromise })
  const data = parsed.data
  const vacancyId = Number(formData.get('vacancyId'))

  try {
    // The role must still be open — published, with a closing date in the future.
    const vacancies = Number.isFinite(vacancyId)
      ? await payload.find({
          collection: 'vacancies',
          limit: 1,
          overrideAccess: false,
          pagination: false,
          where: {
            and: [
              { id: { equals: vacancyId } },
              { _status: { equals: 'published' } },
              { closingDate: { greater_than: new Date().toISOString() } },
            ],
          },
        })
      : null
    const vacancy = vacancies?.docs[0]

    if (!vacancy) {
      return {
        message: 'This role has closed — applications are no longer being accepted.',
        ok: false,
      }
    }

    // Store the CV in the access-controlled cv-uploads collection (never public).
    const cvDoc = await payload.create({
      collection: 'cv-uploads',
      data: {},
      file: {
        data: Buffer.from(await file.arrayBuffer()),
        mimetype: cvMimetype,
        name: sanitiseFilename(file.name),
        size: file.size,
      },
    })

    await payload.create({
      collection: 'job-applications',
      data: {
        applicationStatus: 'new',
        coverNote: data.coverNote,
        cv: cvDoc.id,
        email: data.email,
        name: data.name,
        phone: data.phone || undefined,
        vacancy: vacancy.id,
      },
    })

    // Notify the configured recipients.
    const emailSettings = await payload.findGlobal({ slug: 'email-settings' }).catch(() => null)
    const recipients = (emailSettings?.jobsRecipients ?? [])
      .map((recipient) => recipient.email)
      .filter(Boolean)

    if (recipients.length > 0) {
      await payload
        .sendEmail({
          from: emailSettings?.fromEmail
            ? `"${emailSettings.fromName ?? 'BBAlliance'}" <${emailSettings.fromEmail}>`
            : undefined,
          html: [
            `<p><strong>Role:</strong> ${escapeHTML(vacancy.title)}</p>`,
            `<p><strong>From:</strong> ${escapeHTML(data.name)} &lt;${escapeHTML(data.email)}&gt;</p>`,
            data.phone ? `<p><strong>Phone:</strong> ${escapeHTML(data.phone)}</p>` : '',
            `<p><strong>Cover note:</strong></p>`,
            `<p>${escapeHTML(data.coverNote).replace(/\n/g, '<br />')}</p>`,
            `<p>The CV is attached to the application in the dashboard (Inbox → Job Applications).</p>`,
          ].join('\n'),
          subject: `New application: ${vacancy.title}`,
          to: recipients.join(', '),
        })
        .catch((error) => {
          payload.logger.error({ err: error, msg: 'Application email failed to send' })
        })
    }

    return { ok: true }
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Job application submission failed' })
    return {
      message: 'Something went wrong at our end — please try again, or email us your CV directly.',
      ok: false,
    }
  }
}

/** Keep the original (readable) name but strip anything path-like or unsafe. */
const sanitiseFilename = (name: string): string => {
  const cleaned = name
    .replace(/[/\\]/g, '_')
    .replace(/[^\w. ()-]+/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
  // slice from the end so the extension always survives
  return (cleaned || 'cv.pdf').slice(-120)
}

const escapeHTML = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
