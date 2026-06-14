import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Zentrale Medien-Bibliothek: alle Bilder der Projekte.
// Dateien werden lokal unter /media abgelegt; Payload erzeugt automatisch
// responsive Größen (wie Astros Bild-Pipeline, nur eben aus dem CMS).
export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Bild',
    plural: 'Bilder',
  },
  admin: {
    group: 'Inhalte',
    description: 'Alle Bilder zum Wiederverwenden in Projekten.',
  },
  access: {
    read: () => true, // öffentlich lesbar (für die Website)
  },
  upload: {
    // In Produktion/Docker per MEDIA_DIR auf ein persistentes Volume zeigen.
    staticDir: process.env.MEDIA_DIR || path.resolve(dirname, '../../media'),
    mimeTypes: ['image/*'],
    // Responsive Größen — decken die Breakpoints des Frontends ab
    // (Cover/Hero/Galerie). Astro/Browser wählt per srcset die passende.
    imageSizes: [
      { name: 'thumbnail', width: 480, height: undefined },
      { name: 'card', width: 768, height: undefined },
      { name: 'breit', width: 1100, height: undefined },
      { name: 'gross', width: 1500, height: undefined },
      { name: 'hero', width: 2000, height: undefined },
      { name: 'hero2x', width: 2600, height: undefined },
    ],
    focalPoint: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alternativtext (Barrierefreiheit / SEO)',
      admin: {
        description: 'Kurze Bildbeschreibung. Hilft Suchmaschinen und Screenreadern.',
      },
    },
  ],
}
