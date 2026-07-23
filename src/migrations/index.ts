import * as migration_20260723_014737_initial from './20260723_014737_initial';

export const migrations = [
  {
    up: migration_20260723_014737_initial.up,
    down: migration_20260723_014737_initial.down,
    name: '20260723_014737_initial'
  },
];
