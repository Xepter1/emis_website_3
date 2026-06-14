import * as migration_20260614_205412_initial from './20260614_205412_initial';

export const migrations = [
  {
    up: migration_20260614_205412_initial.up,
    down: migration_20260614_205412_initial.down,
    name: '20260614_205412_initial'
  },
];
