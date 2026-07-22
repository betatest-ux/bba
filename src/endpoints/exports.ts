import type { Endpoint, PayloadRequest } from 'payload'

import { hasRole } from '@/access/roles'
import type { User } from '@/payload-types'

/** RFC 4180-ish CSV escaping. */
const csvCell = (value: unknown): string => {
  const text = value === null || value === undefined ? '' : String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const toCSV = (headerRow: string[], rows: unknown[][]): string =>
  [headerRow, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')

const requireEditor = (req: PayloadRequest): Response | null => {
  const user = req.user as User | null
  if (!hasRole(user, 'admin', 'editor')) {
    return Response.json({ error: 'Not allowed' }, { status: 403 })
  }
  return null
}

const csvResponse = (filename: string, csv: string): Response =>
  new Response('﻿' + csv, {
    headers: {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'text/csv; charset=utf-8',
    },
  })

/**
 * CSV exports for the admin panel, linked from the dashboard:
 *  GET /api/export/subscribers — newsletter subscribers
 *  GET /api/export/submissions — form submissions (optional ?form=<id>)
 */
export const exportEndpoints: Endpoint[] = [
  {
    handler: async (req) => {
      const denied = requireEditor(req)
      if (denied) return denied

      const subscribers = await req.payload.find({
        collection: 'newsletter-subscribers',
        depth: 0,
        limit: 100000,
        pagination: false,
        sort: '-createdAt',
      })

      const csv = toCSV(
        ['email', 'confirmed', 'consent_given_at', 'confirmed_at', 'signed_up_at'],
        subscribers.docs.map((subscriber) => [
          subscriber.email,
          subscriber.confirmed ? 'yes' : 'no',
          subscriber.consentAt ?? '',
          subscriber.confirmedAt ?? '',
          subscriber.createdAt,
        ]),
      )

      return csvResponse('newsletter-subscribers.csv', csv)
    },
    method: 'get',
    path: '/export/subscribers',
  },
  {
    handler: async (req) => {
      const denied = requireEditor(req)
      if (denied) return denied

      const formId = typeof req.query?.form === 'string' ? req.query.form : undefined

      const submissions = await req.payload.find({
        collection: 'form-submissions',
        depth: 1,
        limit: 100000,
        pagination: false,
        sort: '-createdAt',
        ...(formId ? { where: { form: { equals: formId } } } : {}),
      })

      // Collect every field name that appears across submissions.
      const fieldNames: string[] = []
      for (const submission of submissions.docs) {
        for (const entry of submission.submissionData ?? []) {
          if (!fieldNames.includes(entry.field)) fieldNames.push(entry.field)
        }
      }

      const csv = toCSV(
        ['submitted_at', 'form', 'read', ...fieldNames],
        submissions.docs.map((submission) => {
          const values = new Map(
            (submission.submissionData ?? []).map((entry) => [entry.field, entry.value]),
          )
          const formTitle =
            typeof submission.form === 'object' ? submission.form.title : submission.form
          return [
            submission.createdAt,
            formTitle,
            (submission as { isRead?: boolean }).isRead ? 'yes' : 'no',
            ...fieldNames.map((field) => values.get(field) ?? ''),
          ]
        }),
      )

      return csvResponse('form-submissions.csv', csv)
    },
    method: 'get',
    path: '/export/submissions',
  },
]
