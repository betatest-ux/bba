import type { CollectionConfig } from 'payload'

import path from 'path'
import { fileURLToPath } from 'url'

import { isAdminOrEditor, noApiWrite } from '@/access/roles'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * CVs uploaded with job applications. Stored OUTSIDE the public directory and
 * served only through Payload's access-controlled API — never publicly
 * listable. Created exclusively by the application server action.
 */
export const CVUploads: CollectionConfig = {
  slug: 'cv-uploads',
  labels: {
    singular: 'CV Upload',
    plural: 'CV Uploads',
  },
  access: {
    create: noApiWrite,
    delete: isAdminOrEditor,
    read: isAdminOrEditor,
    update: noApiWrite,
  },
  admin: {
    description: 'CVs attached to job applications. Only admins and editors can open these.',
    group: 'Inbox',
  },
  fields: [],
  upload: {
    // Deliberately not under public/ — files go through the API with access control.
    staticDir: path.resolve(dirname, '../../private-uploads/cvs'),
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
}
