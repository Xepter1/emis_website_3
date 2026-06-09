/**
 * Zentrale Seiten-Daten — an EINER Stelle pflegen.
 * TODO(Emi): E-Mail (und ggf. Social-Links) durch die echten Werte ersetzen.
 */
export const site = {
  name: "Emi",
  brand: "EMS Design",
  tagline: "Grafikdesignerin",
  email: "mail@designbyems.de",
  // Optional: Profile. Leer lassen, wenn nicht gewünscht.
  social: [
    // { label: "Instagram", href: "https://instagram.com/…" },
    // { label: "LinkedIn", href: "https://linkedin.com/in/…" },
  ] as { label: string; href: string }[],
};
