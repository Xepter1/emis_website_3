# emi — Portfolio

Das Portfolio von **Emi**, Grafik- & Corporate-Designerin.
Ein Gedanke trägt die ganze Seite:

> **Rahmen leise, Inhalt laut.**
> Der Rahmen — Navigation, Schrift, Raster, Bewegung, Footer — hat *eine*
> ruhige, sichere Stimme und ändert sich nie. Jedes Projekt darf darin eine
> komplett eigene Welt entfalten (eigene Farben, eigene Stimmung). Der Rahmen
> ist Emis Marke; die Projekte zeigen ihre Bandbreite.

---

## Tech-Stack

| | |
|---|---|
| **Framework** | [Astro](https://astro.build) (statisch) |
| **Styling** | Tailwind CSS v4 + ein eigenes Token-System (`src/styles/global.css`) |
| **Bewegung** | Native **View Transitions** (Astro `ClientRouter`) + **GSAP** (feine In-Welt-Parallax) |
| **Inhalte** | Astro **Content Collections** (MDX) — pflegbar, ohne Code |
| **Schrift** | **ITC Avant Garde Gothic** (exklusiv) — siehe [Schrift tauschen](#schrift-echte-itc-avant-garde-gothic-einsetzen) |
| **Bilder** | Astro Assets → moderne Formate (WebP/AVIF), responsiv, ohne Layout-Sprung |

---

## Lokal starten

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # statisches Deploy nach dist/
npm run preview    # Build lokal ansehen
```

Node ≥ 18.20 (entwickelt mit Node 22).

---

## Deploy

Das Ergebnis ist eine rein **statische** Seite (`dist/`). Funktioniert auf
Netlify, Vercel, Cloudflare Pages u. ä.

- **Build-Command:** `npm run build`
- **Publish-Verzeichnis:** `dist`
- Vor dem ersten Deploy in `astro.config.mjs` `site` auf die echte Domain
  setzen (steuert Canonical-URLs, Sitemap und absolute OG-Bildpfade).

---

## Deployment mit Docker / Portainer

Die Seite läuft als winziges **Nginx-Image**, das die statischen Dateien
ausliefert (mehrstufiges `Dockerfile`: Node baut → Nginx serviert `dist/`).

**Automatischer Image-Build (GitHub Actions → GHCR).**
Bei jedem Push auf `main` baut `.github/workflows/docker.yml` das Image und
pusht es nach `ghcr.io/xepter1/emis_website_3:latest`.

**Einmalig: GHCR-Paket sichtbar machen.**
Nach dem ersten erfolgreichen Workflow-Lauf, damit Portainer ohne Login ziehen
kann: GitHub → Repo → „Packages" → `emis_website_3` → „Package settings" →
„Change visibility" → **Public**.
(Alternativ in Portainer eine GHCR-Registry mit einem Token mit `read:packages`
hinterlegen — dann darf das Paket privat bleiben.)

**In Portainer (Stack).**
1. Stacks → „Add stack" → Inhalt von `docker-compose.yml` einfügen — oder in
   einem bestehenden Stack das Image `ghcr.io/xepter1/emis_website_3:latest`
   als Service eintragen.
2. Host-Port unter `ports` auf einen freien Wert setzen (Standard `8087:80`)
   oder die Seite per Reverse-Proxy / Labels einbinden.
3. „Deploy the stack".

**Updates = „Pull and redeploy".**
Künftig: committen + auf `main` pushen → Actions baut das Image neu → in
Portainer am Stack **„Pull and redeploy"** drücken (zieht `:latest` neu und
startet den Container). Mehr ist nicht nötig.

> Eigene Domain: vorher `site` in `astro.config.mjs` setzen — das Image wird
> beim nächsten Push automatisch neu gebaut.

**Lokal testen (optional):**

```bash
docker build -t emis-website .
docker run --rm -p 8087:80 emis-website   # → http://localhost:8087
```

---

## Ein neues Projekt anlegen (ohne Code)

> **Neu: Das geht jetzt komfortabel im CMS.** Emi öffnet
> `https://designbyems.de/admin`, loggt sich ein (E-Mail + Passwort) und klickt
> **Projekte → Neu**: Felder ausfüllen, Bilder per Drag & Drop hochladen,
> **Speichern** – die Änderung ist sofort live. Kein Datei-Editieren, kein
> Entwickler nötig. Aufbau & Betrieb des CMS: siehe [DEPLOY.md](DEPLOY.md).
>
> Die Felder im CMS entsprechen exakt den unten beschriebenen (titel, jahr,
> disziplin, Farbwelt, Abschnitte voll/breit/duo/text/zitat …). Die folgende
> Datei-Variante bleibt als technische Referenz erhalten.

<details>
<summary>Technische Referenz: Projekt als Datei (altes Verfahren)</summary>

Jedes Projekt war **ein Ordner** unter `src/content/projekte/`.

1. Kopiere einen bestehenden Ordner, z. B. `coffeecats/`, und benenne ihn um
   (der Ordnername wird die URL: `/projekte/<ordnername>`).
2. Lege die Bilder hinein (Cover + Galerie). Große Originale ruhig hineinlegen —
   Astro rechnet sie beim Build automatisch klein und in moderne Formate um.
3. Öffne `index.mdx` und fülle die Felder aus:

```yaml
titel: Projektname
kunde: Kunde — kurze Beschreibung
jahr: 2025
disziplin: [Corporate Design, Logo]     # Liste
kurzbeschreibung: Ein, zwei Sätze für Übersicht & Vorschau.
reihenfolge: 1                            # kleinere Zahl = weiter vorne
ausgezeichnet: false                      # optional
status: live                              # "live" oder "in-arbeit"

cover: ./cover.jpg                        # Übersichtsbild (Pflicht bei live)
coverFokus: center 50%                    # optional: Bildausschnitt

welt:                                     # die Farben DIESER Projektwelt
  papier: "#fbf4e3"                       # Hintergrund
  tinte: "#2a1c11"                        # Schrift
  akzent: "#7a4a12"                       # Akzent
  sekundaer: "#a98c5f"                    # gedämpft (Captions)
  linie: "#2a1c1122"                      # Haarlinien (Hex mit Alpha ok)
  stimmung: hell                          # "hell" oder "dunkel"

einleitung: Der eine ruhige Eröffnungssatz.
aufgabe: Worum ging es? Der Gedanke dahinter.
leistung: [Logo, Farbsystem, Packaging]   # Liste

abschnitte:                               # die Erzählung, in Reihenfolge
  - layout: text
    ueberschrift: Die Idee
    text: Ein Absatz Fließtext.
  - layout: breit                         # großes Bild im Raster
    bild: ./01.jpg
    bildunterschrift: optional
  - layout: voll                          # randloses, volles Bild
    bild: ./02.jpg
    hoch: false                           # true bei Hochformat
  - layout: duo                           # zwei Bilder nebeneinander
    bilder: [./03.jpg, ./04.jpg]
  - layout: zitat
    zitat: Ein großer Gedanke.
    quelle: optional
```

Speichern — fertig. Auf der Startseite erscheint die Übersicht automatisch,
unter `/projekte/<ordnername>` die eigene Case-Welt mit dem Morph-Übergang.

### Platzhalter („In Arbeit")
`status: in-arbeit` zeigt einen ruhigen, klar markierten Platzhalter-Slot
(kein Coverbild nötig, keine Case-Seite). Sobald du `cover` + Inhalte ergänzt
und `status: live` setzt, erscheint die volle Case-Seite von selbst.
Ein solcher Platzhalter ist aktuell angelegt
(`in-arbeit-editorial/`).

</details>

---

## Schrift: echte ITC Avant Garde Gothic einsetzen

Die Seite nutzt **exklusiv ITC Avant Garde Gothic**. Da diese lizenzpflichtig
ist, liegt aktuell der **frei lizenzierte, metrik-kompatible Klon
„TeX Gyre Adventor"** bei (identische Geometrie) — so ist die Seite sofort
und ohne Lizenzkosten deploybar.

**Tausch auf die echte ITC** (z. B. via Adobe Fonts oder gekaufte Webfonts) —
nur an *einer* Stelle, in `src/styles/global.css`:

- **Variante A – Adobe Fonts:** das Avant-Garde-Kit im `<head>` einbinden
  (`src/layouts/BaseLayout.astro`) und in `global.css` die vier `@font-face`-
  Blöcke löschen. Im Token `--font-sans` bleibt `"Avant Garde Gothic"` als
  erster Name — Adobe liefert die Familie unter ihrem eigenen Namen, daher
  diesen Namen in `--font-sans` ergänzen/voranstellen.
- **Variante B – eigene Lizenz-Dateien:** die echten `.woff2` nach
  `public/fonts/` legen und in den vier `@font-face`-Blöcken die `src`-URLs
  ersetzen. Familienname (`"Avant Garde Gothic"`) bleibt gleich — keine
  weitere Änderung nötig. Die echte ITC bringt mehr Schnitte (Book/Medium/
  Demi/Bold) mit; bei Bedarf weitere `@font-face` mit `font-weight: 500/600`
  ergänzen.

---

## Noch zu erledigen (Platzhalter)

Im Code mit `TODO(Emi)` markiert:

- **E-Mail:** in `src/site.ts` (`email`) die echte Adresse eintragen
  (wird in Footer + Kontakt verwendet).
- **Jahreszahlen:** in den `index.mdx` der Projekte prüfen (als Annahme gesetzt).
- **Domain:** `site` in `astro.config.mjs` und der Sitemap-Link in
  `public/robots.txt`.
- **Zwei weitere Projekte:** die „In Arbeit"-Platzhalter mit echten Cases füllen.

---

## Struktur

```
src/
├─ styles/global.css        Design-System: Schrift, Farben, Skala, Bewegung
├─ site.ts                  zentrale Daten (E-Mail, Name)
├─ content.config.ts        Schema der Projekte (Content Collections)
├─ content/projekte/        ein Ordner = ein Projekt (MDX + Bilder)
├─ layouts/BaseLayout.astro der heilige Rahmen (Head, Nav, Footer, Cursor, Transitions)
├─ components/              Nav, Footer, Cursor
└─ pages/
   ├─ index.astro           Startseite — kuratierte Übersicht
   ├─ ueber.astro           Über
   ├─ kontakt.astro         Kontakt
   └─ projekte/[slug].astro Case-Vorlage (Projektwelt)
public/
├─ fonts/                   Avant-Garde-Schnitte (woff2)
└─ brand/                   Logo, Bildmarke, Unterschrift, Favicon, OG-Bild
```

## Barrierefreiheit & Performance

- Voll tastaturbedienbar, sichtbarer Fokus, „Zum Inhalt springen"-Link.
- Alle Bewegung (Reveals, Cursor, Parallax) respektiert
  `prefers-reduced-motion`.
- Bilder: moderne Formate, responsive `srcset`, korrekte Maße → kein
  Layout-Sprung; Hero-Bilder mit Priorität, restliche lazy.
- Eine Schrift, vorab geladen → schneller, ruhiger Aufbau.
