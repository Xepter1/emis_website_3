import { getPayload } from 'payload'
import config from '@payload-config'

// Zentraler Zugriff auf die Payload-Instanz (Server-seitig).
export const getPayloadClient = async () => getPayload({ config })
