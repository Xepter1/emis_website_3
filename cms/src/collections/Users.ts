import type { CollectionConfig } from 'payload'

// Login-Zugang für die Pflege der Website (Emi).
// "auth: true" macht daraus die zentrale Anmeldung fürs Admin-Panel (/admin).
export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Benutzer',
    plural: 'Benutzer',
  },
  auth: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email'],
    group: 'Verwaltung',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
      required: true,
    },
    // E-Mail und Passwort werden durch "auth: true" automatisch ergänzt.
  ],
}
