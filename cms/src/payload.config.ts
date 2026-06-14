import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Projekte } from './collections/Projekte'
import { seedIfEmpty } from './seed/seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Öffentliche Adresse des CMS (z. B. https://designbyems.de).
// Nur nötig, sobald das CMS über eine Domain läuft – dann braucht Payload
// diese Angabe, damit das Admin-Login (Cookies/CSRF) sauber funktioniert.
// Lokal/über IP:Port leer lassen.
const publicURL = process.env.PUBLIC_URL || ''

export default buildConfig({
  ...(publicURL ? { serverURL: publicURL } : {}),
  cors: publicURL ? [publicURL] : undefined,
  csrf: publicURL ? [publicURL] : undefined,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · Emi – Verwaltung',
      description: 'Verwaltung der Projekte von Emi',
    },
  },
  // Reihenfolge = Reihenfolge in der Admin-Sidebar
  collections: [Projekte, Media, Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./emi.db',
    },
    // In Entwicklung: Schema automatisch synchronisieren (push).
    // In Produktion: über Migrationen (werden beim Containerstart ausgeführt).
    push: process.env.NODE_ENV !== 'production',
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  // Beim ersten Start einmalig die bestehenden Projekte übertragen (nur wenn leer).
  onInit: async (payload) => {
    await seedIfEmpty(payload)
  },
  sharp,
  // Deutsche Admin-Oberfläche als Standard
  i18n: {
    fallbackLanguage: 'de',
  },
})
