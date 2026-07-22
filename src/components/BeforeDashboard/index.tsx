import type { ServerProps } from 'payload'

import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import { hasRole } from '@/access/roles'
import type { User } from '@/payload-types'
import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

const formatDate = (value: string | null | undefined): string =>
  value
    ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

/**
 * At-a-glance dashboard: unread submissions, upcoming events, closing
 * vacancies, recent edits and a site-health note.
 */
const BeforeDashboard: React.FC<ServerProps> = async (props) => {
  const { payload, user } = props
  const typedUser = user as User | null
  const isAdminUser = hasRole(typedUser, 'admin')

  const now = new Date().toISOString()
  const soon = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const [unreadSubmissions, unreadApplications, upcomingEvents, closingVacancies, pageCount] =
    await Promise.all([
      payload.count({
        collection: 'form-submissions',
        where: { isRead: { not_equals: true } },
      }),
      payload.count({
        collection: 'job-applications',
        where: { isRead: { not_equals: true } },
      }),
      payload.find({
        collection: 'events',
        where: { startDate: { greater_than: now }, _status: { equals: 'published' } },
        sort: 'startDate',
        limit: 3,
        depth: 0,
        select: { title: true, startDate: true },
      }),
      payload.find({
        collection: 'vacancies',
        where: {
          closingDate: { greater_than: now, less_than: soon },
          _status: { equals: 'published' },
        },
        sort: 'closingDate',
        limit: 3,
        depth: 0,
        select: { title: true, closingDate: true },
      }),
      payload.count({ collection: 'pages' }),
    ])

  const recentActivity = isAdminUser
    ? await payload.find({
        collection: 'activity-log',
        sort: '-createdAt',
        limit: 5,
        depth: 0,
      })
    : null

  const needsSeed = pageCount.totalDocs === 0

  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>
          Welcome back{typedUser?.name ? `, ${typedUser.name.split(' ')[0].replace(/\[.*/, '')}` : ''} — here’s
          how the site is doing.
        </h4>
      </Banner>

      <div className={`${baseClass}__grid`}>
        <div className={`${baseClass}__card`}>
          <h5>📬 Inbox</h5>
          <p>
            <a href="/admin/collections/form-submissions?where[isRead][not_equals]=true">
              {unreadSubmissions.totalDocs} unread form submission
              {unreadSubmissions.totalDocs === 1 ? '' : 's'}
            </a>
          </p>
          <p>
            <a href="/admin/collections/job-applications?where[isRead][not_equals]=true">
              {unreadApplications.totalDocs} unread job application
              {unreadApplications.totalDocs === 1 ? '' : 's'}
            </a>
          </p>
          <p>
            <small>
              Export CSV: <a href="/api/export/submissions">submissions</a> ·{' '}
              <a href="/api/export/subscribers">newsletter subscribers</a>
            </small>
          </p>
        </div>

        <div className={`${baseClass}__card`}>
          <h5>📅 Upcoming events</h5>
          {upcomingEvents.docs.length === 0 && <p>No upcoming events — add one?</p>}
          <ul>
            {upcomingEvents.docs.map((event) => (
              <li key={event.id}>
                <a href={`/admin/collections/events/${event.id}`}>{event.title}</a>{' '}
                <small>{formatDate(event.startDate)}</small>
              </li>
            ))}
          </ul>
        </div>

        <div className={`${baseClass}__card`}>
          <h5>⏳ Vacancies closing this week</h5>
          {closingVacancies.docs.length === 0 && <p>Nothing closing in the next 7 days.</p>}
          <ul>
            {closingVacancies.docs.map((vacancy) => (
              <li key={vacancy.id}>
                <a href={`/admin/collections/vacancies/${vacancy.id}`}>{vacancy.title}</a>{' '}
                <small>closes {formatDate(vacancy.closingDate)}</small>
              </li>
            ))}
          </ul>
        </div>

        {recentActivity && (
          <div className={`${baseClass}__card`}>
            <h5>✏️ Recent changes</h5>
            <ul>
              {recentActivity.docs.map((entry) => (
                <li key={entry.id}>
                  <small>
                    {entry.userEmail} {entry.action} {entry.collectionSlug ?? entry.globalSlug}
                    {entry.title ? ` — “${entry.title}”` : ''}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={`${baseClass}__card`}>
          <h5>❤️ Site health</h5>
          <p>
            {needsSeed ? (
              <>
                The site looks empty. <SeedButton /> to load the demo content, then replace the
                [PLACEHOLDER] text with real details.
              </>
            ) : (
              <>
                Content is in place. Remember: placeholder text is marked{' '}
                <strong>[PLACEHOLDER — replace]</strong>, and regular backups can be taken with{' '}
                <code>pnpm backup</code> (see README).
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export default BeforeDashboard
