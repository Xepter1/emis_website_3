# Deployment – Emis Website mit CMS

Die Seite besteht aus **vier kleinen Diensten** in einem Stack:

| Dienst | Was | Port (intern) |
|---|---|---|
| **web** | Astro-SSR-Frontend (Design unverändert), holt Inhalte live aus dem CMS | `4321` |
| **cms** | Payload-CMS: Login unter `/admin`, Inhalte-DB (SQLite), Bild-Uploads | `3001` |
| **form** | Kontaktformular-Dienst (Node + nodemailer): nimmt `/api/kontakt` entgegen, mailt per SMTP an `mail@designbyems.de` + Auto-Bestätigung. Kein Drittanbieter. | `8080` |
| **proxy** | winziger Caddy, teilt eine Domain auf: `/api/kontakt` → form, `/admin*` + `/api/*` + `/_next/*` → cms, sonst → web | `80` |

> **Reihenfolge im Proxy ist wichtig:** `/api/kontakt` wird **vor** der
> generischen `/api/*`-Regel an den `form`-Dienst geroutet, sonst würde das CMS
> die Route abfangen. Siehe `proxy/Caddyfile`.

Nach außen ist der Stack damit **„ein Upstream auf Port 80"** – exakt das Muster,
das dein bestehender Multi-Tenant-Caddy schon nutzt. An Firewall, äußerem Caddy
und den anderen Kunden (z. B. `symphonieorchester`) muss **nichts** angefasst
werden.

> **Wichtigster Punkt:** Die Volumes **`cms_data`** (SQLite-DB mit Emis
> Projekten) und **`cms_media`** (hochgeladene Bilder) müssen **persistent**
> bleiben. Sie liegen bewusst NICHT im Git-Repo. Ohne sie sind nach einem
> Update alle Inhalte weg.

---

## Portainer-Git-Stack (Multi-Tenant-Caddy mit Labels)

Die Seite läuft als **Portainer-Git-Stack** (gleiches Muster wie der
`xepter`-Stack): Portainer klont dieses Repo und baut die Images selbst. Der
Stack zeigt auf die Produktions-Compose **`compose.hetzner.yml`** im Repo-Root.

> **Zwei Compose-Dateien, ein Repo:**
> - `compose.hetzner.yml` → **Produktion/Portainer.** Nur der `proxy` hängt am
>   externen `caddy`-Netz und trägt die Domain-Labels
>   (`caddy: designbyems.de, www.designbyems.de` → `{{upstreams 80}}`).
> - `docker-compose.yml` → **nur lokaler Test** (Host-Port `8087:80`, kein
>   externes Netz). Siehe „Lokal testen" weiter unten.
>
> web/cms/form bleiben in beiden im internen Netz; die Pfad-Aufteilung macht der
> proxy (`proxy/Caddyfile`): `/api/kontakt` → form, `/admin*` + `/api/*` +
> `/_next/*` → cms, alles andere → web.

### Stack in Portainer anlegen

1. **Stacks → Add stack → Git Repository.**
2. Repository: `git@github.com:Xepter1/emis_website_3.git` (bzw. HTTPS + Token),
   Branch `main`, **Compose path: `compose.hetzner.yml`**.
3. Unter **Environment variables** setzen (NIE ins Git):

   | Variable | Wert |
   |---|---|
   | `PAYLOAD_SECRET` | `<openssl rand -hex 32>` |
   | `PUBLIC_URL` | `https://designbyems.de` |
   | `SMTP_HOST` | `mail.your-server.de` |
   | `SMTP_PORT` | `587` (STARTTLS — **NICHT** 465, Hetzner blockt ausgehend) |
   | `SMTP_USER` | `mail@designbyems.de` |
   | `SMTP_PASS` | `<Postfach-Passwort>` |
   | `MAIL_FROM` | `mail@designbyems.de` |
   | `MAIL_TO` | `mail@designbyems.de` |

4. **Deploy the stack.** Danach hat der Stack **Total** control → künftig Env
   ändern + **„Pull and redeploy"** direkt in der UI (wie bei xepter).

> **Migration vom alten CLI-Stack (einmalig):** Bisher lief die Seite per SSH
> unter `/opt/sites/designbyems/`. Bevor der Portainer-Stack deployt, den alten
> **abräumen** — sonst kollidieren die `container_name` (`designbyems-web` usw.):
> ```bash
> cd /opt/sites/designbyems && docker compose down
> ```
> Die alten Volumes (`designbyems_cms_data` / `_media`) sind leer (im CMS steht
> noch nichts) → der neue Stack legt frische an, das CMS sät die 5
> Bestandsprojekte beim ersten Start neu ein. Alte Volumes später mit
> `docker volume rm` entfernen.

> **Warum die Aliase `astro`/`payload` (NICHT `web`/`cms`)?** Der Proxy hängt im
> geteilten `caddy`-Netz. Dort gibt es bei anderen Mandanten ebenfalls Dienste
> namens `web`/`cms` → Docker-DNS lieferte dem Proxy den falschen Container
> (502). Die eindeutigen Aliase existieren nur im internen Netz dieses Stacks.

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

## Update (nach einem Git-Push)

Im Portainer-Stack auf **„Pull and redeploy"** klicken (zieht `main`, baut die
Images neu). Die Env-Variablen (`PAYLOAD_SECRET`, `PUBLIC_URL`, `SMTP_*`) stehen
im Stack-Environment in Portainer (siehe oben) — **nie im Git**.

> Nach einem Recreate von `web`/`cms` den `proxy`-Container in Portainer einmal
> **neu starten** — sonst zeigt der Caddy-Proxy evtl. auf eine veraltete
> Upstream-IP (→ 502, siehe Troubleshooting).

> Ohne die `SMTP_*`-Werte fährt der Stack trotzdem hoch — nur das Kontaktformular
> liefert dann einen sauberen `502` (das Frontend zeigt den `mailto:`-Fallback).

**Zustellbarkeit (offen):** Damit die Auto-Bestätigung an Kunden (Gmail/Outlook)
sicher im Posteingang statt im Spam landet, sollten für `designbyems.de` noch
**DKIM** (Hetzner-Mail-Panel → TXT-Record in die DNS-Zone) und **DMARC**
(`_dmarc.designbyems.de` TXT, z. B. `v=DMARC1; p=none; rua=mailto:mail@designbyems.de`)
eingerichtet werden. SPF sollte auf `~all` enden.

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
