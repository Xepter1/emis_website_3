import { defineMiddleware } from "astro:middleware";

/**
 * Cache-Strategie für die SSR-Seiten.
 *
 * Problem: Ohne Cache-Header cachen Browser HTML „heuristisch" – manche
 * Besucher sehen Text-/Layout-Änderungen erst Stunden später (während
 * gehashte Assets unter /_astro/ sofort durchkommen).
 *
 * Lösung: HTML-Antworten kommen live aus dem CMS und sollen immer aktuell sein.
 * `no-cache` = der Browser darf zwischenspeichern, MUSS aber vor jeder
 * Nutzung beim Server rückfragen → niemand sieht veraltetes HTML. Statische
 * Assets (JS/CSS/Bilder) werden NICHT angefasst – sie behalten ihre langen,
 * unveränderlichen Cache-Header (Content-Hash im Dateinamen).
 */
export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    response.headers.set("Cache-Control", "no-cache");
  }
  return response;
});
