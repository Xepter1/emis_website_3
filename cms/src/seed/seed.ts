import type { Payload } from 'payload'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Ordner mit den mitgelieferten Originalbildern der 5 Bestandsprojekte.
const ASSETS = path.resolve(dirname, '../../seed-assets')

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

/**
 * Überträgt die bestehenden Projekte einmalig ins CMS – nur wenn noch keine
 * Projekte existieren. So geht beim Umstieg von den .mdx-Dateien nichts
 * verloren, und ein bereits gepflegtes CMS wird nicht überschrieben.
 */
export async function seedIfEmpty(payload: Payload) {
  const existing = await payload.count({ collection: 'projekte' })
  if (existing.totalDocs > 0) return

  payload.logger.info('🌱 Übertrage die bestehenden Projekte ins CMS …')

  // Bilder nur einmal hochladen, auch wenn sie mehrfach referenziert werden.
  const cache = new Map<string, number>()
  const img = async (slug: string, file: string, alt: string): Promise<number> => {
    const key = `${slug}/${file}`
    if (cache.has(key)) return cache.get(key)!
    const filePath = path.join(ASSETS, slug, file)
    const data = fs.readFileSync(filePath)
    const ext = path.extname(file).toLowerCase()
    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      file: { data, mimetype: MIME[ext] || 'image/jpeg', name: file, size: data.length },
    })
    cache.set(key, doc.id as number)
    return doc.id as number
  }

  // ── CoffeeCats ──────────────────────────────────────────────
  await payload.create({
    collection: 'projekte',
    data: {
      slug: 'coffeecats',
      titel: 'CoffeeCats',
      jahr: '2025',
      disziplin: ['Corporate Design', 'Logo', 'Packaging'],
      kurzbeschreibung: 'Branding für ein Katzencafé, vom Logo bis zur Speisekarte.',
      reihenfolge: 1,
      ausgezeichnet: true,
      status: 'live',
      cover: await img('coffeecats', 'cover.jpg', 'CoffeeCats – Cover'),
      coverFokus: 'center 58%',
      heroSeiten: [
        { bild: await img('coffeecats', '02-tasse.jpg', 'CoffeeCats – Tasse') },
        { bild: await img('coffeecats', '06-ambiente.jpg', 'CoffeeCats – Ambiente') },
      ],
      aufgabe:
        'CoffeeCats ist ein modernes Cafékonzept mit Fokus auf Ruhe, Genuss und Atmosphäre. Die beiden Hauskatzen Salty & Maple sind Teil der Markenidentität und verleihen dem Café seinen gemütlichen Charakter. Im Rahmen des Projekts entstanden das Corporate Design, verschiedene Anwendungen und eine Speisekarte.',
      leistung: ['Branding für ein Katzencafé vom Logo bis zur Speisekarte'],
      welt: {
        papier: '#fbf4e3',
        tinte: '#2a1c11',
        akzent: '#7a4a12',
        sekundaer: '#a98c5f',
        linie: '#2a1c1122',
        stimmung: 'hell',
      },
      abschnitte: [
        { blockType: 'breit', bild: await img('coffeecats', '01-marke.jpg', 'CoffeeCats – Marke') },
        {
          blockType: 'duo',
          bilder: [
            { bild: await img('coffeecats', '02-tasse.jpg', 'CoffeeCats – Tasse') },
            { bild: await img('coffeecats', '03-menu.jpg', 'CoffeeCats – Speisekarte') },
          ],
        },
        { blockType: 'voll', bild: await img('coffeecats', '06-ambiente.jpg', 'CoffeeCats – Ambiente') },
        { blockType: 'voll', bild: await img('coffeecats', '07-katze.jpg', 'CoffeeCats – Katze'), hoch: true },
      ],
    },
  })

  // ── VeloDynamics ────────────────────────────────────────────
  await payload.create({
    collection: 'projekte',
    data: {
      slug: 'velodynamics',
      titel: 'VeloDynamics',
      jahr: '2026',
      disziplin: ['Corporate Design', 'Logo', 'Web'],
      kurzbeschreibung: 'Branding für ein Unternehmensplanspiel.',
      reihenfolge: 2,
      ausgezeichnet: false,
      status: 'live',
      cover: await img('velodynamics', 'cover.jpg', 'VeloDynamics – Cover'),
      coverFokus: 'center 50%',
      heroSeiten: [
        { bild: await img('velodynamics', '03-card-a.jpg', 'VeloDynamics – Karte') },
        { bild: await img('velodynamics', '02-web.jpg', 'VeloDynamics – Web') },
      ],
      aufgabe:
        'Velo Dynamics ist ein Unternehmen, das im Rahmen eines Unternehmensplanspiels an der Hochschule Landshut entwickelt wurde. Ziel des Projekts war es, ein realistisches Unternehmenskonzept inklusive Markenauftritt zu gestalten und professionell zu präsentieren. Für das Projekt entstand ein vollständiges Corporate Design, das die Identität und Werte der Marke visuell transportiert. Dazu gehörten die Entwicklung mehrerer Logoansätze, die Definition eines einheitlichen Farb- und Typografiekonzepts sowie die Gestaltung verschiedener Medien wie Flyer, Werbemittel und Präsentationslayouts. Der Fokus lag dabei auf einem modernen, professionellen und hochwertigen Markenauftritt mit klarer visueller Linie.',
      leistung: ['Logo & Markensystem', 'Geschäftsausstattung', 'Webdesign', 'Plakatkampagne', 'Brand Book'],
      welt: {
        papier: '#0c2419',
        tinte: '#eee7d4',
        akzent: '#9bb3a3',
        sekundaer: '#7f9588',
        linie: '#eee7d422',
        stimmung: 'dunkel',
      },
      abschnitte: [
        { blockType: 'voll', bild: await img('velodynamics', '01-billboard.jpg', 'VeloDynamics – Billboard') },
        { blockType: 'breit', bild: await img('velodynamics', '02-web.jpg', 'VeloDynamics – Web') },
        {
          blockType: 'duo',
          bilder: [
            { bild: await img('velodynamics', '03-card-a.jpg', 'VeloDynamics – Karte A') },
            { bild: await img('velodynamics', '04-card-b.jpg', 'VeloDynamics – Karte B') },
          ],
        },
        { blockType: 'voll', bild: await img('velodynamics', '05-vk.jpg', 'VeloDynamics – VK') },
      ],
    },
  })

  // ── ZEN ─────────────────────────────────────────────────────
  await payload.create({
    collection: 'projekte',
    data: {
      slug: 'zen-magazin',
      titel: 'ZEN',
      jahr: '2025',
      disziplin: ['Editorial', 'Coverdesign', 'Typografie'],
      kurzbeschreibung: 'Coverdesign für ZEN – Das Architektur- & Wohnmagazin.',
      reihenfolge: 3,
      status: 'live',
      cover: await img('zen-magazin', 'cover.jpg', 'ZEN – Cover'),
      coverFokus: 'center 45%',
      heroSeiten: [
        { bild: await img('zen-magazin', 'titel-02.png', 'ZEN – Titel 2') },
        { bild: await img('zen-magazin', 'titel-03.png', 'ZEN – Titel 3') },
      ],
      leistung: ['Coverdesign'],
      paletteVerbergen: true,
      welt: {
        papier: '#e9e8e3',
        tinte: '#15140f',
        akzent: '#6f6a60',
        sekundaer: '#9b958a',
        linie: '#15140f1a',
        stimmung: 'hell',
      },
      abschnitte: [
        { blockType: 'breit', bild: await img('zen-magazin', 'titel-01.png', 'ZEN – Titel 1') },
        {
          blockType: 'duo',
          bilder: [
            { bild: await img('zen-magazin', 'titel-02.png', 'ZEN – Titel 2') },
            { bild: await img('zen-magazin', 'titel-03.png', 'ZEN – Titel 3') },
          ],
        },
        { blockType: 'voll', bild: await img('zen-magazin', '01-mockup.jpg', 'ZEN – Mockup') },
      ],
    },
  })

  // ── Xepter ──────────────────────────────────────────────────
  await payload.create({
    collection: 'projekte',
    data: {
      slug: 'xepter',
      titel: 'Xepter',
      titelKlickFarbe: '#f3e9ff',
      kunde: 'Xepter',
      jahr: '2026',
      disziplin: ['Logo', 'Corporate Design'],
      kurzbeschreibung: 'Logo- & Corporate Design für Webdesign-Unternehmen Xepter',
      reihenfolge: 4,
      status: 'live',
      cover: await img('xepter', 'cover.jpg', 'Xepter – Cover'),
      coverFokus: 'center',
      leistung: ['Logo', 'Corporate Design', 'Visitenkarten', 'Geschäftsausstattung'],
      farbpalette: ['#140033', '#3d0a6b', '#7a2bd6', '#f2e8ff', '#e8d1f5', '#e0abff', '#ffb04d'],
      welt: {
        papier: '#1d0f3d',
        tinte: '#f0eafb',
        akzent: '#9a5cf6',
        sekundaer: '#a293c4',
        linie: '#f0eafb20',
        stimmung: 'dunkel',
      },
      abschnitte: [{ blockType: 'breit', bild: await img('xepter', 'logo.png', 'Xepter – Logo') }],
    },
  })

  // ── In-Arbeit-Platzhalter ───────────────────────────────────
  await payload.create({
    collection: 'projekte',
    data: {
      slug: 'in-arbeit-editorial',
      titel: 'Dein Projekt',
      jahr: '2025',
      disziplin: ['Kostenloses Erstgespräch'],
      kurzbeschreibung: 'Hier könnte dein Projekt sein.',
      reihenfolge: 5,
      status: 'in-arbeit',
      cover: await img('in-arbeit-editorial', 'erstgespraech.jpg', 'Erstgespräch'),
      aktion: { label: 'Erstgespräch vereinbaren', href: '/kontakt' },
      welt: {
        papier: '#dcdedb',
        tinte: '#2b2f2b',
        akzent: '#6f7a70',
        sekundaer: '#8c938a',
        stimmung: 'hell',
      },
    },
  })

  payload.logger.info('✅ 5 Projekte übertragen.')
}
