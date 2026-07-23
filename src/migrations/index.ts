import * as migration_20260723_014737_initial from './20260723_014737_initial';
import * as migration_20260723_032449_add_upload_prefix_columns from './20260723_032449_add_upload_prefix_columns';

export const migrations = [
  {
    up: migration_20260723_014737_initial.up,
    down: migration_20260723_014737_initial.down,
    name: '20260723_014737_initial',
  },
  {
    up: migration_20260723_032449_add_upload_prefix_columns.up,
    down: migration_20260723_032449_add_upload_prefix_columns.down,
    name: '20260723_032449_add_upload_prefix_columns'
  },
];
