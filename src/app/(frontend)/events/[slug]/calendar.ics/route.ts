import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * Escape text per RFC 5545 section 3.3.11: backslashes, semicolons,
 * commas and newlines must be escaped in TEXT property values.
 */
const escapeICSText = (value: string): string =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n')

/** UTC basic format: YYYYMMDDTHHMMSSZ */
const toICSDate = (date: Date): string =>
  date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')

const TWO_HOURS_MS = 2 * 60 * 60 * 1000

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'events',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    where: {
      and: [{ slug: { equals: decodedSlug } }, { _status: { equals: 'published' } }],
    },
  })

  const event = result.docs?.[0]

  if (!event) {
    return new Response('Event not found', { status: 404 })
  }

  const start = new Date(event.startDate)
  const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + TWO_HOURS_MS)

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BBAlliance//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${decodedSlug}@bballiance.org.uk`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${escapeICSText(event.title)}`,
    `LOCATION:${escapeICSText(event.venue)}`,
    ...(event.summary ? [`DESCRIPTION:${escapeICSText(event.summary)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return new Response(lines.join('\r\n') + '\r\n', {
    headers: {
      'Content-Disposition': `attachment; filename="${decodedSlug}.ics"`,
      'Content-Type': 'text/calendar; charset=utf-8',
    },
  })
}
