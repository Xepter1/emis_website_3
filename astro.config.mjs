// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// Hinweis: `site` auf die echte Domain setzen, sobald sie steht.
// Sie steuert kanonische URLs, Sitemap und absolute Open-Graph-Bildpfade.
export default defineConfig({
  site: 'https://designbyems.de',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // Astro/Sharp erzeugt moderne, responsive Bilder. Layout-Sprünge vermeiden
    // wir, indem jedes <Image> width/height aus dem Import trägt.
    responsiveStyles: true,
  },
  // SSR: Inhalte werden zur Laufzeit live aus dem CMS (Payload) geholt.
  // Eine Änderung im CMS ist sofort online – ohne Neu-Build.
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  // Im Container an ALLE Adressen binden (0.0.0.0), sonst erreicht der Proxy
  // den SSR-Server nicht (er lauscht sonst nur auf localhost).
  server: { host: true, port: 4321 },
});
