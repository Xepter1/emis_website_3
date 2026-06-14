# Deployment – Emis Website mit CMS

Seit dem CMS-Umbau besteht die Seite aus **drei kleinen Diensten** in einem Stack:

| Dienst | Was | Port (intern) |
|---|---|---|
| **web** | Astro-SSR-Frontend (Design unverändert), holt Inhalte live aus dem CMS | `4321` |
| **cms** | Payload-CMS: Login unter `/admin`, Inhalte-DB (SQLite), Bild-Uploads | `3001` |
| **proxy** | winziger Caddy, teilt eine Domain auf: `/admin*` + `/api/*` → cms, sonst → web | `80` |

Nach außen ist der Stack damit **„ein Upstream auf Port 80"** – exakt das Muster,
das dein bestehender Multi-Tenant-Caddy schon nutzt. An Firewall, äußerem Caddy
und den anderen Kunden (z. B. `symphonieorchester`) muss **nichts** angefasst
werden.

> **Wichtigster Punkt:** Die Volumes **`cms_data`** (SQLite-DB mit Emis
> Projekten) und **`cms_media`** (hochgeladene Bilder) müssen **persistent**
> bleiben. Sie liegen bewusst NICHT im Git-Repo. Ohne sie sind nach einem
> Update alle Inhalte weg.

---

## Server-Compose (Multi-Tenant-Caddy mit Labels)

Auf dem Server (`/opt/sites/designbyems/`) liegt – wie gehabt – eine **eigene**
`docker-compose.yml` (nicht die Repo-Datei). Sie unterscheidet sich von der
Repo-Vorlage nur am `proxy`-Dienst: dort gehören die Caddy-Labels und das
externe `caddy`-Netz hin (statt des Host-Ports):

Die aktuell laufende Server-Compose (`/opt/sites/designbyems/docker-compose.yml`):

```yaml
services:
  web:
    build: { context: ./app, dockerfile: Dockerfile }
    image: designbyems-web:latest
    container_name: designbyems-web
    restart: unless-stopped
    depends_on: [cms]
    environment:
      NODE_ENV: production
      HOST: 0.0.0.0
      PORT: "4321"
      CMS_INTERNAL_URL: http://payload:3001
      CMS_PUBLIC_URL: ${PUBLIC_URL}
    networks:
      internal: { aliases: [astro] }

  cms:
    build: { context: ./app/cms, dockerfile: Dockerfile }
    image: designbyems-cms:latest
    container_name: designbyems-cms
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: "3001"
      PAYLOAD_SECRET: ${PAYLOAD_SECRET}
      DATABASE_URI: file:/app/data/emi.db
      MEDIA_DIR: /app/media
      PUBLIC_URL: ${PUBLIC_URL}
    volumes:
      - cms_data:/app/data
      - cms_media:/app/media
    networks:
      internal: { aliases: [payload] }

  proxy:
    image: caddy:2-alpine
    container_name: designbyems-proxy
    restart: unless-stopped
    depends_on: [web, cms]
    volumes:
      - ./app/proxy/Caddyfile:/etc/caddy/Caddyfile:ro
    networks: [internal, caddy]
    labels:
      caddy: designbyems.de, www.designbyems.de
      caddy.reverse_proxy: "{{upstreams 80}}"

networks:
  internal:
  caddy:
    external: true

volumes:
  cms_data:
  cms_media:
```

> **Warum die Aliase `astro`/`payload` (NICHT `web`/`cms`)?** Der Proxy hängt im
> geteilten `caddy`-Netz. Dort gibt es bei anderen Mandanten ebenfalls Dienste
> namens `web`/`cms` → Docker-DNS lieferte dem Proxy den falschen Container
> (502). Die eindeutigen Aliase existieren nur im internen Netz dieses Stacks.
>
> Hinweis: Die alten Labels zeigten auf den nginx-Container. Sie wandern 1:1 auf
> `proxy` – derselbe Port 80, dieselbe Domain. Die Pfad-Aufteilung passiert
> INTERN im Proxy (`proxy/Caddyfile`).

### Troubleshooting

- **502 auf `/`, aber `/admin` geht:** Der Proxy-Caddy hat eine veraltete
  Upstream-IP gecacht (z. B. nachdem `web`/`cms` neu erstellt wurden).
  `caddy reload` leert diesen Cache NICHT zuverlässig – den Proxy-Container
  **neu starten**: `docker compose restart proxy`. Faustregel: Nach jedem
  Recreate von `web`/`cms` auch `proxy` neu starten.
- **`no such table: projekte` im CMS-Log:** Migration lief nicht. `start:prod`
  führt `payload migrate` aus; die Migrationsdateien liegen in
  `app/cms/src/migrations/`. Bei Bedarf `docker compose up -d --build cms`.

---

## Erststart / Update

```bash
# auf dem Server
cd /opt/sites/designbyems/app && git fetch --depth 1 origin main && git reset --hard origin/main
cd /opt/sites/designbyems && docker compose up -d --build
docker compose restart proxy   # Upstream-DNS-Cache frisch (siehe Troubleshooting)
```

Voraussetzung – einmalig in der Server-`.env` (neben der Compose):

```env
PAYLOAD_SECRET=<openssl rand -hex 32>
PUBLIC_URL=https://designbyems.de
```

Beim **ersten** Start überträgt das CMS automatisch die **5 bestehenden
Projekte** in die Datenbank (nur wenn die DB leer ist – Updates überschreiben
nichts).

**Ersten Login anlegen:** `https://designbyems.de/admin` öffnen – beim ersten
Aufruf legt Payload das Admin-Konto an (E-Mail + Passwort für Emi).

---

## Lokal testen (ganzer Stack)

```bash
PUBLIC_URL=http://localhost:8087 PAYLOAD_SECRET=$(openssl rand -hex 32) \
  docker compose up --build
# → Frontend & Admin unter http://localhost:8087  (Admin: .../admin)
```

(Der `proxy`-Dienst gibt lokal Port `8087:80` frei; auf dem Server wird dieser
Block durch die Caddy-Labels ersetzt.)

## Lokal entwickeln (ohne Docker, zwei Terminals)

```bash
# Terminal 1 – CMS (Payload) auf http://localhost:3001/admin
cd cms && npm install && npm run dev

# Terminal 2 – Astro-Frontend auf http://localhost:4321
npm install && npm run dev
```

Das Frontend liest standardmäßig von `http://localhost:3001`. Zum Abweichen die
Variablen `CMS_INTERNAL_URL` / `CMS_PUBLIC_URL` setzen.

---

## Hinweis: altes statisches Setup

`nginx.conf` und der GHCR-Workflow (`.github/workflows/docker.yml`) stammen vom
früheren rein statischen Aufbau. Die Seite ist jetzt SSR (Node) + CMS –
`nginx.conf` wird nicht mehr verwendet und kann später entfernt werden.
