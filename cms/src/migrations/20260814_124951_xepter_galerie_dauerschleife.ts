import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

import { loeserFuerBestand } from '../inhalte/medien'
import { MEDIEN } from '../inhalte/projektinhalte'

/**
 * Nachtrag August 2026.
 *
 *   1. Videos laufen jetzt ausnahmslos in Endlosschleife, ohne Bedienknöpfe.
 *      Das Feld „Abspielverhalten" hätte damit keine Wirkung mehr und fällt
 *      weg, statt als wirkungsloses Auswahlfeld im CMS stehen zu bleiben.
 *   2. Xepter zeigt seine drei Bilder untereinander statt zwei nebeneinander.
 *
 * Bewusst eng gefasst: Angefasst wird ausschließlich Xepters Galerie. Alle
 * anderen Projekte und Felder bleiben unberührt.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`projekte\` DROP COLUMN \`hero_video_modus\`;`)

  const bild = loeserFuerBestand(payload)

  const ergebnis = await payload.update({
    collection: 'projekte',
    where: { slug: { equals: 'xepter' } },
    data: {
      // Alle drei untereinander, jedes über die volle Rasterbreite — als
      // „breit" wird keines beschnitten (die Signatur ist etwa 5:1).
      abschnitte: [
        { blockType: 'breit', bild: await bild(MEDIEN.xepterLogo) },
        { blockType: 'breit', bild: await bild(MEDIEN.xepterCover) },
        { blockType: 'breit', bild: await bild(MEDIEN.xepterSignatur) },
      ],
    } as any,
    depth: 0,
    req,
  })

  if (ergebnis.docs.length === 0) {
    payload.logger.warn('Projekt „xepter" nicht gefunden – Galerie unverändert.')
    return
  }
  if (ergebnis.errors?.length) {
    payload.logger.error(`Xepter: ${ergebnis.errors.map((e) => e.message).join(' · ')}`)
    return
  }
  payload.logger.info('✅ Xepter-Galerie: drei Bilder untereinander.')
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`projekte\` ADD \`hero_video_modus\` text DEFAULT 'einmal';`)
}
