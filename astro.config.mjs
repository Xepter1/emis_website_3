// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Hinweis: `site` auf die echte Domain setzen, sobald sie steht.
// Sie steuert kanonische URLs, Sitemap und absolute Open-Graph-Bildpfade.
export default defineConfig({
  site: 'https://emi.design',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // Astro/Sharp erzeugt moderne, responsive Bilder. Layout-Sprünge vermeiden
    // wir, indem jedes <Image> width/height aus dem Import trägt.
    responsiveStyles: true,
  },
  // Statisches Deploy (Netlify / Vercel / Cloudflare Pages).
  output: 'static',
});
