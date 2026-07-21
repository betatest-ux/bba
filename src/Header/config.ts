import type { GlobalConfig } from 'payload'

import { isAdminOrEditor } from '@/access/roles'
import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header Menu',
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  admin: {
    description:
      'The main site menu. Drag items to reorder. Add child links to create a dropdown. Mark one item (usually Donate) as highlighted to style it as a button.',
    group: 'Settings',
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
        {
          name: 'highlight',
          type: 'checkbox',
          admin: {
            description: 'Style this item as a stand-out button (use for Donate).',
          },
          defaultValue: false,
        },
        {
          name: 'children',
          type: 'array',
          admin: {
            description: 'Optional dropdown links under this item.',
            initCollapsed: true,
          },
          fields: [
            link({
              appearances: false,
            }),
          ],
          label: 'Dropdown links',
          maxRows: 8,
        },
      ],
      maxRows: 8,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
