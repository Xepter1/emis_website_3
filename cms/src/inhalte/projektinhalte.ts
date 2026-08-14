/**
 * DER INHALTLICHE SOLL-STAND DER PROJEKTE — an EINER Stelle.
 *
 * Zwei Wege führen zu denselben Inhalten, deshalb liegen sie hier gemeinsam:
 *
 *   • seed.ts       legt eine LEERE Datenbank neu an (frische Installation).
 *   • die Migration bringt eine BESTEHENDE Datenbank auf denselben Stand
 *     (Produktion – dort liegen Emis Projekte in einem persistenten Volume und
 *     werden vom Seed nie wieder angefasst).
 *
 * Beide holen sich die Medien über einen `MedienLoeser`, der weiß, wie er an
 * eine Datei kommt: frisch hochladen (Seed) oder die bereits vorhandene in der
 * Mediathek wiederverwenden (Migration).
 */

// ── Medien ──────────────────────────────────────────────────────────────────

export type MediumRef = {
  /** Unterordner in cms/seed-assets/ */
  ordner: string
  /** Dateiname dort */
  datei: string
  /**
   * Dateiname, unter dem das Medium in einer BESTEHENDEN Mediathek liegt.
   * Weicht ab, wenn Payload beim Seed umbenannt hat, weil der Name schon
   * belegt war (vier Projekte bringen je eine `cover.jpg` mit → cover-1…3).
   */
  bestand?: string
  alt: string
}

/** Liefert die Payload-ID eines Mediums – hochgeladen oder wiederverwendet. */
export type MedienLoeser = (ref: MediumRef) => Promise<number>

const m = (ordner: string, datei: string, alt: string, bestand?: string): MediumRef => ({
  ordner,
  datei,
  alt,
  bestand,
})

export const MEDIEN = {
  // — VeloDynamics —
  veloVisitenkarte: m(
    'velodynamics',
    'velo-visitenkarte-web.jpg',
    'VeloDynamics – Visitenkarten mit QR-Code auf Beton',
  ),
  veloBrandbookCover: m('velodynamics', 'velo-brandbook-cover.jpg', 'VeloDynamics – Brandbook, Titel'),
  veloBrandbookKompromiss: m(
    'velodynamics',
    'velo-brandbook-kompromiss.jpg',
    'VeloDynamics – Brandbook, Doppelseite „Kein Kompromiss“',
  ),
  veloBrandbookAtmosphaere: m(
    'velodynamics',
    'velo-brandbook-atmosphaere.jpg',
    'VeloDynamics – Brandbook, Doppelseite „Markenatmosphäre“',
  ),
  veloBrandbookVideo: m(
    'velodynamics',
    'velo-brandbook-720p.mp4',
    'VeloDynamics – das Brandbook durchgeblättert',
  ),
  veloBrandbookPoster: m(
    'velodynamics',
    'velo-brandbook-poster.jpg',
    'VeloDynamics – Brandbook, Standbild',
  ),
  veloBillboard: m('velodynamics', '01-billboard.jpg', 'VeloDynamics – Plakatmotiv'),
  veloWeb: m('velodynamics', '02-web.jpg', 'VeloDynamics – Webauftritt'),

  // — Xepter —
  xepterLogo: m('xepter', 'logo.png', 'Xepter – Logo'),
  xepterCover: m('xepter', 'cover.jpg', 'Xepter – Visitenkarten-Mockup', 'cover-3.jpg'),
  xepterSignatur: m('xepter', 'xepter-signatur-web.png', 'Xepter – E-Mail-Signatur'),
  xepterLogoVideo: m('xepter', 'xepter-logo-loop-7s-720p.mp4', 'Xepter – bewegtes Logo'),
  xepterLogoPoster: m('xepter', 'xepter-logo-poster.jpg', 'Xepter – Logo, Standbild'),

  // — ZEN —
  zenCover: m('zen-magazin', 'cover.jpg', 'ZEN – Cover', 'cover-2.jpg'),
  zenTitel1: m('zen-magazin', 'titel-01.png', 'ZEN – Titel 1'),
  zenTitel2: m('zen-magazin', 'titel-02.png', 'ZEN – Titel 2'),
  zenTitel3: m('zen-magazin', 'titel-03.png', 'ZEN – Titel 3'),
  zenMockup: m('zen-magazin', '01-mockup.jpg', 'ZEN – Mockup'),

  // — CoffeeCats —
  ccCover: m('coffeecats', 'cover.jpg', 'CoffeeCats – Cover'),
  ccMarke: m('coffeecats', '01-marke.jpg', 'CoffeeCats – Marke'),
  ccTasse: m('coffeecats', '02-tasse.jpg', 'CoffeeCats – Tasse'),
  ccMenu: m('coffeecats', '03-menu.jpg', 'CoffeeCats – Speisekarte'),
  ccAmbiente: m('coffeecats', '06-ambiente.jpg', 'CoffeeCats – Ambiente'),

  // — Platzhalter —
  erstgespraech: m('in-arbeit-editorial', 'erstgespraech.jpg', 'Erstgespräch'),
}

// ── Inhalte je Projekt ──────────────────────────────────────────────────────
//
// Jede Funktion liefert GENAU die Felder, die sich gegenüber dem Bestand
// ändern dürfen. Was hier nicht steht (Farbwelt, Disziplinen, Titel …), bleibt
// in der Produktion unangetastet.

export async function velodynamics(l: MedienLoeser) {
  return {
    kontext: 'Kundenauftrag',
    reihenfolge: 1,
    // Das alte Cover (cover-1.jpg) wird nirgends mehr verwendet.
    cover: await l(MEDIEN.veloVisitenkarte),
    coverFokus: 'center 50%',
    // Streifen: Visitenkarte (= Cover, trägt den Morph) · Video · Web
    heroSeiten: [
      { bild: await l(MEDIEN.veloVisitenkarte) },
      { bild: await l(MEDIEN.veloWeb) },
    ],
    heroVideo: {
      video: await l(MEDIEN.veloBrandbookVideo),
      poster: await l(MEDIEN.veloBrandbookPoster),
      platzierung: 'mitte' as const,
      modus: 'einmal' as const,
    },
    aufgabe:
      'Velo Dynamics ist ein Unternehmenskonzept, das im Rahmen eines Unternehmensplanspiels an der Hochschule Landshut entstand. Ich wurde beauftragt, dafür den vollständigen Markenauftritt zu gestalten. Es entstand ein vollständiges Corporate Design, das die Identität und Werte der Marke visuell transportiert. Dazu gehörten die Entwicklung mehrerer Logoansätze, die Definition eines einheitlichen Farb- und Typografiekonzepts sowie die Gestaltung verschiedener Medien wie Flyer, Werbemittel und Präsentationslayouts. Der Fokus lag dabei auf einem modernen, professionellen und hochwertigen Markenauftritt mit klarer visueller Linie.',
    abschnitte: [
      {
        blockType: 'duo' as const,
        bilder: [
          { bild: await l(MEDIEN.veloBrandbookCover) },
          { bild: await l(MEDIEN.veloBrandbookKompromiss) },
        ],
      },
      { blockType: 'voll' as const, bild: await l(MEDIEN.veloBrandbookAtmosphaere) },
      { blockType: 'breit' as const, bild: await l(MEDIEN.veloVisitenkarte) },
      {
        blockType: 'duo' as const,
        bilder: [{ bild: await l(MEDIEN.veloBillboard) }, { bild: await l(MEDIEN.veloWeb) }],
      },
    ],
  }
}

export async function xepter(l: MedienLoeser) {
  return {
    kontext: 'Kundenauftrag',
    // „Kunde: Xepter" entfällt — stünde sonst doppelt unter dem Titel.
    kunde: null,
    reihenfolge: 2,
    // Streifen: ein einziges Logo-Video über die volle Breite. Xepter hat
    // insgesamt nur vier Elemente – ein dreiteiliger Streifen wäre fast
    // identisch mit der Galerie darunter und damit bloß eine Wiederholung.
    heroSeiten: [],
    heroVideo: {
      video: await l(MEDIEN.xepterLogoVideo),
      poster: await l(MEDIEN.xepterLogoPoster),
      platzierung: 'ganze-breite' as const,
      modus: 'schleife' as const,
    },
    abschnitte: [
      {
        blockType: 'duo' as const,
        bilder: [{ bild: await l(MEDIEN.xepterLogo) }, { bild: await l(MEDIEN.xepterCover) }],
      },
      // Die Signatur ist etwa 5:1 — als „breit" läuft sie über die volle
      // Rasterbreite, ohne beschnitten zu werden.
      { blockType: 'breit' as const, bild: await l(MEDIEN.xepterSignatur) },
    ],
  }
}

export async function zen(_l: MedienLoeser) {
  return {
    kontext: 'Konzeptarbeit',
    reihenfolge: 3,
    aufgabe:
      'ZEN ist ein fiktives Magazin für Architektur und Wohnen. Die Aufgabe: drei Coverentwürfe zum selben Titelthema „Einfachheit“ – einer fotografisch, einer typografisch, einer illustrativ. Jeder Ansatz übersetzt denselben Begriff mit anderen Mitteln, über Bildwirkung, über Schrift, über Form. Entstanden im Rahmen meines Grafikdesign-Lehrgangs.',
  }
}

export async function coffeecats(l: MedienLoeser) {
  return {
    kontext: 'Konzeptarbeit',
    reihenfolge: 4,
    aufgabe:
      'CoffeeCats ist ein fiktives Cafékonzept mit Fokus auf Ruhe, Genuss und Atmosphäre. Die beiden Hauskatzen Salty & Maple sind Teil der Markenidentität und verleihen dem Café seinen gemütlichen Charakter. Die Aufgabe im Grafikdesign-Lehrgang umfasste den Logoentwurf – das Corporate Design, die Anwendungen und die Speisekarte habe ich darüber hinaus selbst erarbeitet, um die Marke einmal vollständig durchzuspielen.',
    // Das Hochformat-Einzelbild (07-katze.jpg) am Ende entfällt.
    abschnitte: [
      { blockType: 'breit' as const, bild: await l(MEDIEN.ccMarke) },
      {
        blockType: 'duo' as const,
        bilder: [{ bild: await l(MEDIEN.ccTasse) }, { bild: await l(MEDIEN.ccMenu) }],
      },
      { blockType: 'voll' as const, bild: await l(MEDIEN.ccAmbiente) },
    ],
  }
}

export async function platzhalter(_l: MedienLoeser) {
  return { reihenfolge: 5 }
}

/** Alle Änderungen in der Reihenfolge, in der sie angewandt werden. */
export const INHALTE: Array<{
  slug: string
  felder: (l: MedienLoeser) => Promise<Record<string, unknown>>
}> = [
  { slug: 'velodynamics', felder: velodynamics },
  { slug: 'xepter', felder: xepter },
  { slug: 'zen-magazin', felder: zen },
  { slug: 'coffeecats', felder: coffeecats },
  { slug: 'in-arbeit-editorial', felder: platzhalter },
]
