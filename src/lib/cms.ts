/**
 * Datenbrücke Astro ↔ CMS (Payload).
 *
 * Holt die Projekte LIVE aus dem CMS und formt sie exakt so, wie die Seiten
 * sie früher aus den .mdx-Dateien bekamen (`entry.id` + `entry.data.*`).
 * Dadurch bleibt das gesamte Markup/Design unverändert – nur die Quelle der
 * Inhalte wechselt von Dateien zum CMS.
 *
 * Zwei Adressen:
 *   • CMS_INTERNAL_URL – Server-zu-Server (SSR holt die Daten), z. B. im Docker
 *     der interne Dienstname. Lokal: http://localhost:3001
 *   • CMS_PUBLIC_URL   – öffentlich erreichbare Basis für die Bild-URLs, die im
 *     Browser landen. Lokal identisch zu oben.
 */

const INTERNAL_URL =
  (typeof process !== 'undefined' && process.env.CMS_INTERNAL_URL) ||
  import.meta.env.CMS_INTERNAL_URL ||
  'http://localhost:3001';

const PUBLIC_URL =
  (typeof process !== 'undefined' && process.env.CMS_PUBLIC_URL) ||
  import.meta.env.CMS_PUBLIC_URL ||
  'http://localhost:3001';

// — Typen (leichtgewichtig; nur was die Seiten brauchen) —
export type CmsBild = {
  src: string;
  width?: number;
  height?: number;
  alt: string;
  srcset?: string;
};

/** Bewegtbild im Eindrucks-Streifen oben auf der Projektseite. */
export type CmsVideo = {
  src: string;
  poster?: string;
  /** Beschreibung aus der Mediathek — für Screenreader. */
  alt?: string;
  /** „mitte" = zwischen den beiden Seitenbildern, „ganze-breite" = allein als Band. */
  platzierung: 'mitte' | 'ganze-breite';
};

export type Welt = {
  papier: string;
  tinte: string;
  akzent: string;
  sekundaer?: string;
  linie?: string;
  stimmung: 'hell' | 'dunkel';
};

export type Abschnitt =
  | { layout: 'voll'; bild: CmsBild; bildunterschrift?: string; hoch: boolean }
  | { layout: 'breit'; bild: CmsBild; bildunterschrift?: string }
  | { layout: 'duo'; bilder: CmsBild[]; bildunterschrift?: string }
  | { layout: 'text'; ueberschrift?: string; text: string }
  | { layout: 'zitat'; zitat: string; quelle?: string };

export type ProjektData = {
  titel: string;
  titelKlickFarbe?: string;
  kontext?: string;
  kunde?: string;
  jahr: string;
  disziplin: string[];
  kurzbeschreibung: string;
  reihenfolge: number;
  status: 'live' | 'in-arbeit';
  ausgezeichnet: boolean;
  aktion?: { label: string; href: string };
  cover?: CmsBild;
  coverFokus?: string;
  heroSeiten?: CmsBild[];
  heroVideo?: CmsVideo;
  welt: Welt;
  einleitung?: string;
  aufgabe?: string;
  leistung?: string[];
  farbpalette?: string[];
  abschnitte: Abschnitt[];
};

export type Projekt = { id: string; data: ProjektData };

// — Hilfen —
const abs = (url?: string | null): string =>
  !url ? '' : url.startsWith('http') ? url : `${PUBLIC_URL}${url}`;

// Aus einer Payload-Media-Relation ein Bild bauen (mit srcset aus den Größen).
function mapBild(media: any, fallbackAlt = ''): CmsBild | undefined {
  if (!media || typeof media !== 'object') return undefined;
  const sizes = media.sizes || {};
  const kandidaten: Array<{ url?: string; width?: number }> = [
    ...Object.values(sizes).map((s: any) => ({ url: s?.url, width: s?.width })),
    { url: media.url, width: media.width },
  ].filter((c) => c.url && c.width);

  // srcset nach Breite sortiert
  const srcset = kandidaten
    .sort((a, b) => (a.width || 0) - (b.width || 0))
    .map((c) => `${abs(c.url)} ${c.width}w`)
    .join(', ');

  return {
    src: abs(media.url),
    width: media.width ?? undefined,
    height: media.height ?? undefined,
    alt: media.alt || fallbackAlt,
    srcset: srcset || undefined,
  };
}

function mapAbschnitt(b: any): Abschnitt | null {
  switch (b.blockType) {
    case 'voll':
      return {
        layout: 'voll',
        bild: mapBild(b.bild)!,
        bildunterschrift: b.bildunterschrift || undefined,
        hoch: !!b.hoch,
      };
    case 'breit':
      return {
        layout: 'breit',
        bild: mapBild(b.bild)!,
        bildunterschrift: b.bildunterschrift || undefined,
      };
    case 'duo':
      return {
        layout: 'duo',
        bilder: (b.bilder || []).map((x: any) => mapBild(x.bild)!).filter(Boolean),
        bildunterschrift: b.bildunterschrift || undefined,
      };
    case 'text':
      return { layout: 'text', ueberschrift: b.ueberschrift || undefined, text: b.text };
    case 'zitat':
      return { layout: 'zitat', zitat: b.zitat, quelle: b.quelle || undefined };
    default:
      return null;
  }
}

function mapProjekt(doc: any): Projekt {
  const hero = (doc.heroSeiten || [])
    .map((h: any) => mapBild(h.bild, doc.titel))
    .filter(Boolean) as CmsBild[];

  // Video im Streifen — nur wenn wirklich eine Datei hinterlegt ist.
  const hv = doc.heroVideo;
  const heroVideo: CmsVideo | undefined =
    hv && hv.video && typeof hv.video === 'object'
      ? {
          src: abs(hv.video.url),
          poster: hv.poster && typeof hv.poster === 'object' ? abs(hv.poster.url) : undefined,
          alt: hv.video.alt || undefined,
          platzierung: hv.platzierung === 'ganze-breite' ? 'ganze-breite' : 'mitte',
        }
      : undefined;

  // Farbpalette: verbergen → [] (blendet aus); eigene Werte → diese;
  // sonst undefined (Seite leitet aus der Farbwelt ab) – exakt wie bisher.
  let farbpalette: string[] | undefined;
  if (doc.paletteVerbergen) farbpalette = [];
  else if (Array.isArray(doc.farbpalette) && doc.farbpalette.length > 0)
    farbpalette = doc.farbpalette;
  else farbpalette = undefined;

  const aktion =
    doc.status === 'in-arbeit' && doc.aktion?.label && doc.aktion?.href
      ? { label: doc.aktion.label, href: doc.aktion.href }
      : undefined;

  return {
    id: doc.slug,
    data: {
      titel: doc.titel,
      titelKlickFarbe: doc.titelKlickFarbe || undefined,
      kontext: doc.kontext || undefined,
      kunde: doc.kunde || undefined,
      jahr: String(doc.jahr),
      disziplin: doc.disziplin || [],
      kurzbeschreibung: doc.kurzbeschreibung,
      reihenfolge: doc.reihenfolge ?? 99,
      status: doc.status,
      ausgezeichnet: !!doc.ausgezeichnet,
      aktion,
      cover: mapBild(doc.cover, doc.titel),
      coverFokus: doc.coverFokus || undefined,
      heroSeiten: hero.length === 2 ? hero : undefined,
      heroVideo,
      welt: doc.welt,
      einleitung: doc.einleitung || undefined,
      aufgabe: doc.aufgabe || undefined,
      leistung: doc.leistung && doc.leistung.length ? doc.leistung : undefined,
      farbpalette,
      abschnitte: (doc.abschnitte || []).map(mapAbschnitt).filter(Boolean) as Abschnitt[],
    },
  };
}

async function fetchProjekte(): Promise<any[]> {
  const res = await fetch(
    `${INTERNAL_URL}/api/projekte?depth=1&limit=200&sort=reihenfolge`,
    { headers: { Accept: 'application/json' } },
  );
  if (!res.ok) throw new Error(`CMS-Antwort ${res.status} beim Laden der Projekte`);
  const json = await res.json();
  return json.docs || [];
}

/** Alle Projekte, sortiert nach Reihenfolge (für die Startseite). */
export async function getProjekte(): Promise<Projekt[]> {
  const docs = await fetchProjekte();
  return docs.map(mapProjekt).sort((a, b) => a.data.reihenfolge - b.data.reihenfolge);
}

/** Nur Live-Projekte (für Case-Seiten & „nächstes Projekt"). */
export async function getLiveProjekte(): Promise<Projekt[]> {
  return (await getProjekte()).filter((p) => p.data.status === 'live');
}

/** Ein einzelnes Projekt anhand des Slugs. */
export async function getProjekt(slug: string): Promise<Projekt | null> {
  const docs = await fetchProjekte();
  const doc = docs.find((d) => d.slug === slug);
  return doc ? mapProjekt(doc) : null;
}
