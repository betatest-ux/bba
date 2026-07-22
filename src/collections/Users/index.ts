import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminFieldLevel, isAdminOrSelf, isStaff } from '@/access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    // Any staff role may sign in to the admin panel; what they can do inside
    // is governed by per-collection access + the restrictPublish hook.
    admin: ({ req }) => Boolean(req.user),
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrSelf,
    unlock: isAdmin,
    update: isAdminOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'email', 'roles'],
    description:
      'People who can sign in to this admin panel. Admins manage everything; editors manage content; contributors can only save drafts.',
    group: 'Admin',
    useAsTitle: 'name',
  },
  auth: {
    // Basic brute-force protection: 5 attempts, then locked for 10 minutes.
    lockTime: 10 * 60 * 1000,
    maxLoginAttempts: 5,
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        // Sensible password policy: 10+ characters, not a known-terrible one.
        const password = data?.password
        if ((operation === 'create' || operation === 'update') && typeof password === 'string') {
          if (password.length < 10) {
            throw new Error('Passwords must be at least 10 characters — a short phrase works well.')
          }
          const banned = ['password', '1234567890', 'qwertyuiop', 'bballiance']
          if (banned.includes(password.toLowerCase())) {
            throw new Error('That password is too easy to guess — pick something more unusual.')
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'roles',
      type: 'select',
      access: {
        // Only admins may grant or change roles — otherwise anyone could
        // promote themselves.
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
      admin: {
        description:
          'Admin: everything, including settings and users. Editor: all content, no settings. Contributor: drafts only, cannot publish.',
      },
      defaultValue: ['editor'],
      hasMany: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Contributor', value: 'contributor' },
      ],
      required: true,
    },
  ],
  timestamps: true,
}
