import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

import { loeserFuerBestand } from '../inhalte/medien'
import { INHALTE } from '../inhalte/projektinhalte'

/**
 * Änderungswünsche vom August 2026 (Projektansichten).
 *
 * Zwei Teile:
 *   1. Schema  – neues Feld „Kontext“ und das Video im Eindrucks-Streifen.
 *   2. Inhalte – Reihenfolge, Texte, Galerien, Cover und Videos.
 *
 * Teil 2 steckt bewusst HIER und nicht im Seed: In der Produktion liegen Emis
 * Projekte in einem persistenten Volume, das der Seed nie wieder anfasst (er
 * springt bei gefüllter Datenbank sofort heraus). Eine Migration läuft dagegen
 * genau einmal – beim nächsten Start nach dem Deploy – und wird in
 * `payload_migrations` vermerkt.
 *
 * Angefasst werden ausschließlich die Felder aus `inhalte/projektinhalte`.
 * Alles andere (Farbwelten, Disziplinen, Titel, Login-Daten) bleibt unberührt.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // ── 1. Schema ──────────────────────────────────────────────────────────
  await db.run(sql`ALTER TABLE \`projekte\` ADD \`kontext\` text;`)
  await db.run(sql`ALTER TABLE \`projekte\` ADD \`hero_video_video_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`projekte\` ADD \`hero_video_poster_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`projekte\` ADD \`hero_video_platzierung\` text DEFAULT 'mitte';`)
  await db.run(sql`ALTER TABLE \`projekte\` ADD \`hero_video_modus\` text DEFAULT 'einmal';`)
  await db.run(sql`CREATE INDEX \`projekte_hero_video_hero_video_video_idx\` ON \`projekte\` (\`hero_video_video_id\`);`)
  await db.run(sql`CREATE INDEX \`projekte_hero_video_hero_video_poster_idx\` ON \`projekte\` (\`hero_video_poster_id\`);`)

  // ── 2. Inhalte ─────────────────────────────────────────────────────────
  // Frische Installationen kommen über den Seed zum selben Stand; hier geht es
  // um die bereits gefüllte Datenbank.
  const anzahl = await payload.count({ collection: 'projekte', req })
  if (anzahl.totalDocs === 0) {
    payload.logger.info('Keine Projekte vorhanden – der Seed legt den neuen Stand direkt an.')
    return
  }

  const bild = loeserFuerBestand(payload)

  for (const { slug, felder } of INHALTE) {
    const daten = await felder(bild)
    const ergebnis = await payload.update({
      collection: 'projekte',
      where: { slug: { equals: slug } },
      data: daten as any,
      depth: 0,
      req,
    })

    if (ergebnis.docs.length === 0) {
      payload.logger.warn(
        `Projekt „${slug}“ nicht gefunden – die Änderungen dafür wurden übersprungen.`,
      )
      continue
    }
    if (ergebnis.errors?.length) {
      payload.logger.error(
        `Projekt „${slug}“: ${ergebnis.errors.map((e) => e.message).join(' · ')}`,
      )
    }
  }

  payload.logger.info('✅ Projektansichten auf den Stand August 2026 gebracht.')
}

/**
 * Nimmt NUR die Schema-Änderung zurück (Spalten fallen weg). Die inhaltlichen
 * Änderungen — Texte, Reihenfolge, Galerien — bleiben bestehen; sie wären ohne
 * die alten Bilder ohnehin nicht sinnvoll rekonstruierbar.
 */
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_projekte\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`titel\` text NOT NULL,
  	\`titel_klick_farbe\` text,
  	\`kunde\` text,
  	\`kurzbeschreibung\` text NOT NULL,
  	\`cover_id\` integer,
  	\`cover_fokus\` text,
  	\`einleitung\` text,
  	\`aufgabe\` text,
  	\`palette_verbergen\` integer DEFAULT false,
  	\`slug\` text,
  	\`jahr\` text NOT NULL,
  	\`reihenfolge\` numeric DEFAULT 99,
  	\`status\` text DEFAULT 'live' NOT NULL,
  	\`ausgezeichnet\` integer DEFAULT false,
  	\`aktion_label\` text,
  	\`aktion_href\` text,
  	\`welt_papier\` text NOT NULL,
  	\`welt_tinte\` text NOT NULL,
  	\`welt_akzent\` text NOT NULL,
  	\`welt_sekundaer\` text,
  	\`welt_linie\` text,
  	\`welt_stimmung\` text DEFAULT 'hell' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_projekte\`("id", "titel", "titel_klick_farbe", "kunde", "kurzbeschreibung", "cover_id", "cover_fokus", "einleitung", "aufgabe", "palette_verbergen", "slug", "jahr", "reihenfolge", "status", "ausgezeichnet", "aktion_label", "aktion_href", "welt_papier", "welt_tinte", "welt_akzent", "welt_sekundaer", "welt_linie", "welt_stimmung", "updated_at", "created_at") SELECT "id", "titel", "titel_klick_farbe", "kunde", "kurzbeschreibung", "cover_id", "cover_fokus", "einleitung", "aufgabe", "palette_verbergen", "slug", "jahr", "reihenfolge", "status", "ausgezeichnet", "aktion_label", "aktion_href", "welt_papier", "welt_tinte", "welt_akzent", "welt_sekundaer", "welt_linie", "welt_stimmung", "updated_at", "created_at" FROM \`projekte\`;`)
  await db.run(sql`DROP TABLE \`projekte\`;`)
  await db.run(sql`ALTER TABLE \`__new_projekte\` RENAME TO \`projekte\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`projekte_cover_idx\` ON \`projekte\` (\`cover_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`projekte_slug_idx\` ON \`projekte\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`projekte_updated_at_idx\` ON \`projekte\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`projekte_created_at_idx\` ON \`projekte\` (\`created_at\`);`)
}
