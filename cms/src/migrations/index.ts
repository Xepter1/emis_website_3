import * as migration_20260614_205412_initial from './20260614_205412_initial';
import * as migration_20260814_103021_inhalte_aug_2026 from './20260814_103021_inhalte_aug_2026';
import * as migration_20260814_124951_xepter_galerie_dauerschleife from './20260814_124951_xepter_galerie_dauerschleife';

export const migrations = [
  {
    up: migration_20260614_205412_initial.up,
    down: migration_20260614_205412_initial.down,
    name: '20260614_205412_initial',
  },
  {
    up: migration_20260814_103021_inhalte_aug_2026.up,
    down: migration_20260814_103021_inhalte_aug_2026.down,
    name: '20260814_103021_inhalte_aug_2026',
  },
  {
    up: migration_20260814_124951_xepter_galerie_dauerschleife.up,
    down: migration_20260814_124951_xepter_galerie_dauerschleife.down,
    name: '20260814_124951_xepter_galerie_dauerschleife'
  },
];
