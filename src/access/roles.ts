import type { Access, FieldAccess, PayloadRequest } from 'payload'

import type { User } from '@/payload-types'

export type Role = 'admin' | 'editor' | 'contributor'

export const hasRole = (user: User | null | undefined, ...roles: Role[]): boolean => {
  if (!user?.roles) return false
  return user.roles.some((role) => roles.includes(role as Role))
}

export const isAdmin: Access = ({ req: { user } }) => hasRole(user, 'admin')

export const isAdminOrEditor: Access = ({ req: { user } }) => hasRole(user, 'admin', 'editor')

export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) => hasRole(user, 'admin')

/** Admins can manage anyone; other users can only read/update their own account. */
export const isAdminOrSelf: Access = ({ req: { user }, id }) => {
  if (hasRole(user, 'admin')) return true
  if (user && id && String(user.id) === String(id)) return true
  return false
}

/** Any signed-in staff member (admin, editor or contributor). */
export const isStaff: Access = ({ req: { user } }) => Boolean(user)

/** Signed-in staff see everything; the public only sees published documents. */
export const isStaffOrPublished: Access = ({ req: { user } }) => {
  if (user) return true
  return {
    _status: {
      equals: 'published',
    },
  }
}

export const publicRead: Access = () => true

/**
 * Blocks all API-originating writes. Server-side code using the Local API with
 * `overrideAccess` (the default) still works — used for collections that are
 * only ever written by our own server actions (submissions, subscribers, logs).
 */
export const noApiWrite: Access = () => false

export const getUser = (req: PayloadRequest): User | null => (req.user as User | null) ?? null
