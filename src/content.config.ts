import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * PROJEKTE — das pflegbare Content-Modell (Brief Abschnitt 6).
 *
 * Ein Projekt = ein Ordner unter src/content/projekte/<slug>/ mit:
 *   • index.mdx        (diese Felder als Frontmatter, optional Prosa im Body)
 *   • Bilder daneben   (relativ referenziert: ./cover.jpg, ./01-storefront.jpg …)
 *
 * Emi legt ein neues Projekt an, indem sie einen Ordner kopiert und die Felder
 * ausfüllt — kein Code nötig. Siehe README.
 */
const projekte = defineCollection({
  loader: glob({ pattern: "**/index.{md,mdx}", base: "./src/content/projekte" }),
  schema: ({ image }) =>
    z.object({
      // — Pflicht-Kerndaten —
      titel: z.string(),
      kunde: z.string(),
      jahr: z.union([z.string(), z.number()]).transform(String),
      disziplin: z.array(z.string()), // z.B. ["Corporate Design", "Logo"]
      kurzbeschreibung: z.string(), // 1–2 Sätze (Übersicht + Meta)

      // — Kuratierung & Status —
      reihenfolge: z.number().default(99), // kleinere Zahl = weiter vorn auf der Startseite
      status: z.enum(["live", "in-arbeit"]).default("live"),
      ausgezeichnet: z.boolean().default(false), // Hero-Slot auf der Startseite

      // — Übersichtsbild — (Pflicht für live; Platzhalter dürfen ohne)
      cover: image().optional(),
      coverFokus: z.string().optional(), // object-position, z.B. "center 30%"

      // — Die Farben der Projektwelt (Brief Abschnitt 5 & 6) —
      welt: z.object({
        papier: z.string(), // Hintergrund der Welt
        tinte: z.string(), // Schrift/Vordergrund der Welt
        akzent: z.string(), // Akzentfarbe der Welt
        sekundaer: z.string().optional(), // gedämpfter Ton (Captions)
        linie: z.string().optional(), // Haarlinien-Farbe
        stimmung: z.enum(["hell", "dunkel"]).default("hell"), // steuert Frame-Kontrast über der Welt
      }),

      // — Case-Erzählung (Erzählung statt Galerie) —
      einleitung: z.string().optional(), // der eine ruhige Eröffnungssatz
      aufgabe: z.string().optional(), // die Aufgabe / der Gedanke dahinter
      leistung: z.array(z.string()).optional(), // erbrachte Leistungen

      // — Geordnete Abschnitte: die Arbeit groß und atmen lassen —
      abschnitte: z
        .array(
          z.discriminatedUnion("layout", [
            // Vollflächiges Bild, randlos
            z.object({
              layout: z.literal("voll"),
              bild: image(),
              bildunterschrift: z.string().optional(),
              hoch: z.boolean().default(false), // hochformatig → begrenzte Höhe
            }),
            // Großes, im Raster gehaltenes Bild (mit Passepartout-Rand)
            z.object({
              layout: z.literal("breit"),
              bild: image(),
              bildunterschrift: z.string().optional(),
            }),
            // Zwei Bilder nebeneinander
            z.object({
              layout: z.literal("duo"),
              bilder: z.array(image()).length(2),
              bildunterschrift: z.string().optional(),
            }),
            // Ruhiger Textblock im Erzählfluss
            z.object({
              layout: z.literal("text"),
              ueberschrift: z.string().optional(),
              text: z.string(),
            }),
            // Großes Zitat / Gedanke dahinter
            z.object({
              layout: z.literal("zitat"),
              zitat: z.string(),
              quelle: z.string().optional(),
            }),
          ]),
        )
        .default([]),
    })
      // Live-Projekte brauchen ein Coverbild; „in-arbeit"-Platzhalter nicht.
      .refine((d) => d.status === "in-arbeit" || !!d.cover, {
        message: "Live-Projekte brauchen ein cover-Bild.",
        path: ["cover"],
      }),
});

export const collections = { projekte };
