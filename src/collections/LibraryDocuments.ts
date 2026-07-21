import type { CollectionConfig } from 'payload'

import path from 'path'
import { fileURLToPath } from 'url'

import { isAdminOrEditor, isStaff, publicRead } from '@/access/roles'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * The public document library — annual reports, accounts, policies, minutes.
 * Shown at /documents; funders and the Charity Commission expect this.
 */
export const LibraryDocuments: CollectionConfig = {
  slug: 'library-documents',
  labels: {
    singular: 'Document',
    plural: 'Documents',
  },
  access: {
    create: isStaff,
    delete: isAdminOrEditor,
    read: publicRead,
    update: isStaff,
  },
  admin: {
    defaultColumns: ['title', 'year', 'documentCategory'],
    description: 'Public documents — annual reports, accounts, policies, meeting minutes.',
    group: 'Content',
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'year',
      type: 'number',
      admin: { description: 'The year the document covers, e.g. 2025' },
      max: 2100,
      min: 1990,
      required: true,
    },
    {
      name: 'documentCategory',
      type: 'select',
      defaultValue: 'report',
      label: 'Category',
      options: [
        { label: 'Annual report', value: 'report' },
        { label: 'Accounts', value: 'accounts' },
        { label: 'Policy', value: 'policy' },
        { label: 'Meeting minutes', value: 'minutes' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../public/documents'),
    mimeTypes: ['application/pdf'],
  },
  versions: true,
}
