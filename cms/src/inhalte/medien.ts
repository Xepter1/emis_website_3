/**
 * Medien beschaffen — für Seed und Migration.
 *
 * Beide brauchen Payload-IDs von Bildern/Videos, kommen aber aus
 * unterschiedlichen Lagen:
 *
 *   • Seed     – die Mediathek ist leer, jede Datei wird frisch hochgeladen.
 *   • Migration – die Mediathek ist gefüllt. Bestandsdateien werden
 *     wiederverwendet (sonst läge alles doppelt herum), nur wirklich neue
 *     Dateien kommen hinzu.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Payload } from 'payload'

import type { MedienLoeser, MediumRef } from './projektinhalte'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/** Die mitgelieferten Originaldateien (liegen im Image unter /app/seed-assets). */
const ASSETS = path.resolve(dirname, '../../seed-assets')

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
}

async function hochladen(payload: Payload, ref: MediumRef): Promise<number> {
  const quelle = path.join(ASSETS, ref.ordner, ref.datei)
  const daten = fs.readFileSync(quelle)
  const ext = path.extname(ref.datei).toLowerCase()
  const doc = await payload.create({
    collection: 'media',
    data: { alt: ref.alt },
    file: {
      data: daten,
      mimetype: MIME[ext] || 'application/octet-stream',
      name: ref.datei,
      size: daten.length,
    },
  })
  return doc.id as number
}

/** Seed: lädt jede Datei hoch (leere Mediathek). */
export function loeserFuerSeed(payload: Payload): MedienLoeser {
  const zwischenspeicher = new Map<string, number>()
  return async (ref) => {
    const schluessel = `${ref.ordner}/${ref.datei}`
    const bekannt = zwischenspeicher.get(schluessel)
    if (bekannt) return bekannt
    const id = await hochladen(payload, ref)
    zwischenspeicher.set(schluessel, id)
    return id
  }
}

/**
 * Migration: nimmt, was schon da ist — und lädt nur nach, was fehlt.
 * `bestand` ist der Dateiname in der bestehenden Mediathek (kann vom
 * Quelldateinamen abweichen, siehe MediumRef).
 */
export function loeserFuerBestand(payload: Payload): MedienLoeser {
  const zwischenspeicher = new Map<string, number>()
  return async (ref) => {
    const gesucht = ref.bestand ?? ref.datei
    const bekannt = zwischenspeicher.get(gesucht)
    if (bekannt) return bekannt

    const treffer = await payload.find({
      collection: 'media',
      where: { filename: { equals: gesucht } },
      limit: 1,
      depth: 0,
    })

    const id =
      (treffer.docs[0]?.id as number | undefined) ?? (await hochladen(payload, ref))

    zwischenspeicher.set(gesucht, id)
    return id
  }
}
