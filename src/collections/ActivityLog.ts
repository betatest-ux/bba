import type { CollectionConfig } from 'payload'

import { isAdmin, noApiWrite } from '@/access/roles'

/**
 * Immutable audit trail, written by hooks (see src/hooks/activityLog.ts).
 * Visible to admins only; deletable by admins so old entries can be pruned.
 */
export const ActivityLog: CollectionConfig = {
  slug: 'activity-log',
  labels: {
    singular: 'Activity Log Entry',
    plural: 'Activity Log',
  },
  access: {
    create: noApiWrite,
    delete: isAdmin,
    read: isAdmin,
    update: noApiWrite,
  },
  admin: {
    defaultColumns: ['createdAt', 'userEmail', 'action', 'collectionSlug', 'title'],
    description: 'Who changed what, and when. Written automatically — entries cannot be edited.',
    group: 'Admin',
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      admin: { readOnly: true },
      relationTo: 'users',
    },
    {
      name: 'userEmail',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'action',
      type: 'select',
      admin: { readOnly: true },
      options: [
        { label: 'Created', value: 'created' },
        { label: 'Updated', value: 'updated' },
        { label: 'Deleted', value: 'deleted' },
      ],
      required: true,
    },
    {
      name: 'collectionSlug',
      type: 'text',
      admin: { readOnly: true },
      label: 'Collection',
    },
    {
      name: 'globalSlug',
      type: 'text',
      admin: { readOnly: true },
      label: 'Setting',
    },
    {
      name: 'documentId',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'title',
      type: 'text',
      admin: { readOnly: true },
    },
  ],
  timestamps: true,
}
