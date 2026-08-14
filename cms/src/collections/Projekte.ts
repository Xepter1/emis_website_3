import type { CollectionConfig } from 'payload'

// Slug-Helfer: macht aus dem Titel ein URL-Kürzel (wie der Astro-Ordnername).
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[äàá]/g, 'a')
    .replace(/[öòó]/g, 'o')
    .replace(/[üùú]/g, 'u')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

/**
 * PROJEKTE — das pflegbare Content-Modell (1:1 zum bisherigen Astro-Schema).
 * Emi legt hier ein neues Projekt an: Felder ausfüllen, Bilder per Drag & Drop
 * hochladen, „Speichern". Kein Code, kein Nachfragen.
 */
export const Projekte: CollectionConfig = {
  slug: 'projekte',
  labels: {
    singular: 'Projekt',
    plural: 'Projekte',
  },
  admin: {
    useAsTitle: 'titel',
    defaultColumns: ['titel', 'jahr', 'status', 'reihenfolge'],
    group: 'Inhalte',
    description: 'Deine Projekte – anlegen, bearbeiten, sortieren.',
  },
  access: {
    read: () => true, // öffentlich lesbar (für die Website)
  },
  defaultSort: 'reihenfolge',
  fields: [
    // ── Hauptspalte ─────────────────────────────────────────────
    {
      name: 'titel',
      type: 'text',
      label: 'Titel',
      required: true,
    },
    {
      name: 'titelKlickFarbe',
      type: 'text',
      label: 'Titel-Klickfarbe (optional)',
      admin: {
        description:
          'Hex-Farbe, die der Titel auf der Projektseite per Klick annimmt (kleines Detail, z. B. Xepter). Leer = nicht klickbar.',
      },
    },
    {
      name: 'kontext',
      type: 'text',
      label: 'Kontext',
      admin: {
        description:
          'Art des Projekts – erscheint als erste Spalte der Metazeile. z. B. „Kundenauftrag“ oder „Konzeptarbeit“.',
      },
    },
    {
      name: 'kunde',
      type: 'text',
      label: 'Kunde (optional)',
      admin: {
        description:
          'Nur ausfüllen, wenn der Auftraggeber NICHT schon im Titel steht. Leer = die Spalte erscheint gar nicht.',
      },
    },
    {
      name: 'kurzbeschreibung',
      type: 'textarea',
      label: 'Kurzbeschreibung',
      required: true,
      admin: { description: '1–2 Sätze für Übersicht & Vorschau.' },
    },
    {
      name: 'disziplin',
      type: 'text',
      hasMany: true,
      label: 'Disziplin(en)',
      required: true,
      admin: { description: 'z. B. Corporate Design, Logo, Web. Enter zum Hinzufügen.' },
    },

    // ── Bilder ──────────────────────────────────────────────────
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: 'Übersichtsbild (Cover)',
      admin: { description: 'Pflicht bei „live“. Bei Platzhaltern optional.' },
    },
    {
      name: 'coverFokus',
      type: 'text',
      label: 'Cover-Bildausschnitt (optional)',
      admin: { description: 'CSS object-position, z. B. „center 30%“. Leer = center.' },
    },
    {
      name: 'heroSeiten',
      type: 'array',
      label: 'Hero-Triptychon (optional)',
      labels: { singular: 'Seitenbild', plural: 'Seitenbilder' },
      minRows: 0,
      maxRows: 2,
      admin: {
        description:
          'Entweder leer lassen (klassischer großer Hero) ODER genau 2 Bilder links & rechts neben dem Cover.',
      },
      fields: [
        {
          name: 'bild',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Bild',
        },
      ],
    },
    {
      name: 'heroVideo',
      type: 'group',
      label: 'Video im Eindrucks-Streifen (optional)',
      admin: {
        description:
          'Bewegtbild oben auf der Projektseite. Leer lassen = Streifen bleibt rein aus Bildern. Läuft stumm in Endlosschleife und startet erst, wenn es beim Scrollen sichtbar wird.',
      },
      fields: [
        {
          name: 'video',
          type: 'upload',
          relationTo: 'media',
          label: 'Video (MP4, stumm)',
          admin: { description: 'Bereits web-optimiert hochladen – es wird nicht neu gerechnet.' },
        },
        {
          name: 'poster',
          type: 'upload',
          relationTo: 'media',
          label: 'Standbild (Poster)',
          admin: {
            description:
              'Wird gezeigt, solange das Video lädt – und bei „Bewegung reduzieren“ statt des Videos. Videos taugen nicht als Cover/Vorschaubild, dafür immer ein Standbild.',
          },
        },
        {
          name: 'platzierung',
          type: 'select',
          label: 'Platzierung',
          defaultValue: 'mitte',
          options: [
            { label: 'In der Mitte des Streifens (zwischen zwei Bildern)', value: 'mitte' },
            { label: 'Alleine über die volle Breite', value: 'ganze-breite' },
          ],
        },
      ],
    },

    // ── Erzählung (Case) ────────────────────────────────────────
    {
      name: 'einleitung',
      type: 'textarea',
      label: 'Einleitung (optional)',
      admin: { description: 'Der eine ruhige Eröffnungssatz.' },
    },
    {
      name: 'aufgabe',
      type: 'textarea',
      label: 'Über das Projekt / Aufgabe (optional)',
    },
    {
      name: 'leistung',
      type: 'text',
      hasMany: true,
      label: 'Leistungen (optional)',
      admin: { description: 'z. B. Logo, Geschäftsausstattung, Webdesign.' },
    },

    // ── Farbpalette ─────────────────────────────────────────────
    {
      name: 'paletteVerbergen',
      type: 'checkbox',
      label: 'Farbpalette ausblenden',
      defaultValue: false,
      admin: {
        description:
          'Wenn aktiv, wird auf der Projektseite keine Farbpalette gezeigt (wie bei ZEN).',
      },
    },
    {
      name: 'farbpalette',
      type: 'text',
      hasMany: true,
      label: 'Farbpalette (optional, eigene Hex-Werte)',
      admin: {
        description:
          'Leer = wird automatisch aus der Farbwelt abgeleitet. Eigene Hex-Werte überschreiben das.',
        condition: (data) => !data?.paletteVerbergen,
      },
    },

    // ── Die Abschnitte (Erzählung statt Galerie) ────────────────
    {
      name: 'abschnitte',
      type: 'blocks',
      label: 'Abschnitte',
      labels: { singular: 'Abschnitt', plural: 'Abschnitte' },
      admin: {
        description: 'Bausteine der Projektseite – in beliebiger Reihenfolge.',
      },
      blocks: [
        {
          slug: 'voll',
          labels: { singular: 'Vollbild', plural: 'Vollbilder' },
          fields: [
            { name: 'bild', type: 'upload', relationTo: 'media', required: true, label: 'Bild' },
            { name: 'bildunterschrift', type: 'text', label: 'Bildunterschrift (optional)' },
            {
              name: 'hoch',
              type: 'checkbox',
              label: 'Hochformat (eingepasst, nicht beschnitten)',
              defaultValue: false,
            },
          ],
        },
        {
          slug: 'breit',
          labels: { singular: 'Breites Bild', plural: 'Breite Bilder' },
          fields: [
            { name: 'bild', type: 'upload', relationTo: 'media', required: true, label: 'Bild' },
            { name: 'bildunterschrift', type: 'text', label: 'Bildunterschrift (optional)' },
          ],
        },
        {
          slug: 'duo',
          labels: { singular: 'Bildpaar', plural: 'Bildpaare' },
          fields: [
            {
              name: 'bilder',
              type: 'array',
              label: 'Zwei Bilder',
              labels: { singular: 'Bild', plural: 'Bilder' },
              minRows: 2,
              maxRows: 2,
              required: true,
              fields: [
                { name: 'bild', type: 'upload', relationTo: 'media', required: true, label: 'Bild' },
              ],
            },
            { name: 'bildunterschrift', type: 'text', label: 'Bildunterschrift (optional)' },
          ],
        },
        {
          slug: 'text',
          labels: { singular: 'Textblock', plural: 'Textblöcke' },
          fields: [
            { name: 'ueberschrift', type: 'text', label: 'Überschrift (optional)' },
            { name: 'text', type: 'textarea', label: 'Text', required: true },
          ],
        },
        {
          slug: 'zitat',
          labels: { singular: 'Zitat', plural: 'Zitate' },
          fields: [
            { name: 'zitat', type: 'textarea', label: 'Zitat', required: true },
            { name: 'quelle', type: 'text', label: 'Quelle (optional)' },
          ],
        },
      ],
    },

    // ── Seitenleiste: Kuratierung & Status ──────────────────────
    {
      name: 'slug',
      type: 'text',
      label: 'URL-Kürzel',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Adresse der Projektseite (/projekte/<kürzel>). Wird aus dem Titel erzeugt, falls leer.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (value) return slugify(String(value))
            if (data?.titel) return slugify(String(data.titel))
            return value
          },
        ],
      },
    },
    {
      name: 'jahr',
      type: 'text',
      label: 'Jahr',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'reihenfolge',
      type: 'number',
      label: 'Reihenfolge',
      defaultValue: 99,
      admin: {
        position: 'sidebar',
        description: 'Kleinere Zahl = weiter vorn auf der Startseite.',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'live',
      options: [
        { label: 'Live (sichtbar mit eigener Seite)', value: 'live' },
        { label: 'In Arbeit (Platzhalter)', value: 'in-arbeit' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'ausgezeichnet',
      type: 'checkbox',
      label: 'Ausgezeichnet (Hero-Slot)',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'aktion',
      type: 'group',
      label: 'Handlungsaufruf (nur „In Arbeit“)',
      admin: {
        position: 'sidebar',
        description:
          'Verwandelt einen Platzhalter in eine anklickbare Einladung (z. B. „Erstgespräch vereinbaren“ → /kontakt).',
        condition: (data) => data?.status === 'in-arbeit',
      },
      fields: [
        { name: 'label', type: 'text', label: 'Text (statt „In Arbeit“)' },
        { name: 'href', type: 'text', label: 'Ziel, z. B. /kontakt' },
      ],
    },

    // ── Seitenleiste: Farbwelt ──────────────────────────────────
    {
      name: 'welt',
      type: 'group',
      label: 'Farbwelt',
      admin: {
        position: 'sidebar',
        description: 'Die Farben DIESER Projektwelt (Hex-Werte).',
      },
      fields: [
        { name: 'papier', type: 'text', label: 'Papier (Hintergrund)', required: true },
        { name: 'tinte', type: 'text', label: 'Tinte (Schrift)', required: true },
        { name: 'akzent', type: 'text', label: 'Akzent', required: true },
        { name: 'sekundaer', type: 'text', label: 'Sekundär (gedämpft, optional)' },
        { name: 'linie', type: 'text', label: 'Linie (Haarlinien, optional)' },
        {
          name: 'stimmung',
          type: 'select',
          label: 'Stimmung',
          required: true,
          defaultValue: 'hell',
          options: [
            { label: 'Hell', value: 'hell' },
            { label: 'Dunkel', value: 'dunkel' },
          ],
        },
      ],
    },
  ],
}
