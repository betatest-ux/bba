import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, noApiWrite } from '@/access/roles'

/**
 * Applications submitted from vacancy pages. Created only by the server
 * action (which validates, rate-limits and stores the CV privately).
 */
export const JobApplications: CollectionConfig = {
  slug: 'job-applications',
  labels: {
    singular: 'Job Application',
    plural: 'Job Applications',
  },
  access: {
    create: noApiWrite,
    delete: isAdminOrEditor,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
  },
  admin: {
    defaultColumns: ['name', 'vacancy', 'applicationStatus', 'isRead', 'createdAt'],
    description: 'Applications for vacancies. Update the status as you review each one.',
    group: 'Inbox',
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'vacancy',
      type: 'relationship',
      admin: { readOnly: true },
      relationTo: 'vacancies',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      admin: { readOnly: true },
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      admin: { readOnly: true },
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'coverNote',
      type: 'textarea',
      admin: { readOnly: true },
    },
    {
      name: 'cv',
      type: 'relationship',
      admin: { readOnly: true },
      relationTo: 'cv-uploads',
    },
    {
      name: 'applicationStatus',
      type: 'select',
      admin: { position: 'sidebar' },
      defaultValue: 'new',
      label: 'Status',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Reviewed', value: 'reviewed' },
        { label: 'Shortlisted', value: 'shortlisted' },
        { label: 'Unsuccessful', value: 'unsuccessful' },
      ],
      required: true,
    },
    {
      name: 'isRead',
      type: 'checkbox',
      admin: { position: 'sidebar' },
      defaultValue: false,
      label: 'Read',
    },
  ],
  timestamps: true,
}
