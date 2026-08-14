import type { Payload } from 'payload'

import { loeserFuerSeed } from '../inhalte/medien'
import { MEDIEN, coffeecats, platzhalter, velodynamics, xepter, zen } from '../inhalte/projektinhalte'

/**
 * Überträgt die bestehenden Projekte einmalig ins CMS – nur wenn noch keine
 * Projekte existieren. So geht beim Umstieg von den .mdx-Dateien nichts
 * verloren, und ein bereits gepflegtes CMS wird nicht überschrieben.
 *
 * Hier steht der GRUNDSTOCK jedes Projekts (Titel, Disziplinen, Farbwelt …).
 * Alles, was sich später über eine Migration weiterentwickelt hat — Kontext,
 * Reihenfolge, Texte, Galerien, Videos —, kommt aus `inhalte/projektinhalte`.
 * Dadurch entsteht bei einer frischen Installation derselbe Stand wie in der
 * gepflegten Produktion.
 */
export async function seedIfEmpty(payload: Payload) {
  const existing = await payload.count({ collection: 'projekte' })
  if (existing.totalDocs > 0) return

  payload.logger.info('🌱 Übertrage die bestehenden Projekte ins CMS …')

  const bild = loeserFuerSeed(payload)

  // ── VeloDynamics ────────────────────────────────────────────
  await payload.create({
    collection: 'projekte',
    data: {
      slug: 'velodynamics',
      titel: 'VeloDynamics',
      jahr: '2026',
      disziplin: ['Corporate Design', 'Logo', 'Web'],
      kurzbeschreibung: 'Branding für ein Unternehmensplanspiel.',
      ausgezeichnet: false,
      status: 'live',
      leistung: ['Logo & Markensystem', 'Geschäftsausstattung', 'Webdesign', 'Plakatkampagne', 'Brand Book'],
      welt: {
        papier: '#0c2419',
        tinte: '#eee7d4',
        akzent: '#9bb3a3',
        sekundaer: '#7f9588',
        linie: '#eee7d422',
        stimmung: 'dunkel',
      },
      ...(await velodynamics(bild)),
    },
  })

  // ── Xepter ──────────────────────────────────────────────────
  await payload.create({
    collection: 'projekte',
    data: {
      slug: 'xepter',
      titel: 'Xepter',
      titelKlickFarbe: '#f3e9ff',
      jahr: '2026',
      disziplin: ['Logo', 'Corporate Design'],
      kurzbeschreibung: 'Logo- & Corporate Design für Webdesign-Unternehmen Xepter',
      status: 'live',
      cover: await bild(MEDIEN.xepterCover),
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
      ...(await xepter(bild)),
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
      status: 'live',
      cover: await bild(MEDIEN.zenCover),
      coverFokus: 'center 45%',
      heroSeiten: [{ bild: await bild(MEDIEN.zenTitel2) }, { bild: await bild(MEDIEN.zenTitel3) }],
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
        { blockType: 'breit', bild: await bild(MEDIEN.zenTitel1) },
        {
          blockType: 'duo',
          bilder: [{ bild: await bild(MEDIEN.zenTitel2) }, { bild: await bild(MEDIEN.zenTitel3) }],
        },
        { blockType: 'voll', bild: await bild(MEDIEN.zenMockup) },
      ],
      ...(await zen(bild)),
    },
  })

  // ── CoffeeCats ──────────────────────────────────────────────
  await payload.create({
    collection: 'projekte',
    data: {
      slug: 'coffeecats',
      titel: 'CoffeeCats',
      jahr: '2025',
      disziplin: ['Corporate Design', 'Logo', 'Packaging'],
      kurzbeschreibung: 'Branding für ein Katzencafé, vom Logo bis zur Speisekarte.',
      ausgezeichnet: true,
      status: 'live',
      cover: await bild(MEDIEN.ccCover),
      coverFokus: 'center 58%',
      heroSeiten: [{ bild: await bild(MEDIEN.ccTasse) }, { bild: await bild(MEDIEN.ccAmbiente) }],
      leistung: ['Branding für ein Katzencafé vom Logo bis zur Speisekarte'],
      welt: {
        papier: '#fbf4e3',
        tinte: '#2a1c11',
        akzent: '#7a4a12',
        sekundaer: '#a98c5f',
        linie: '#2a1c1122',
        stimmung: 'hell',
      },
      ...(await coffeecats(bild)),
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
      status: 'in-arbeit',
      cover: await bild(MEDIEN.erstgespraech),
      aktion: { label: 'Erstgespräch vereinbaren', href: '/kontakt' },
      welt: {
        papier: '#dcdedb',
        tinte: '#2b2f2b',
        akzent: '#6f7a70',
        sekundaer: '#8c938a',
        stimmung: 'hell',
      },
      ...(await platzhalter(bild)),
    },
  })

  payload.logger.info('✅ 5 Projekte übertragen.')
}
