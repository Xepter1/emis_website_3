# Kontaktformular-Dienst (`designbyems.de/api/kontakt`)

Selbst gehosteter Backend-Dienst, der das Kontaktformular von **designbyems.de**
entgegennimmt und per SMTP an `mail@designbyems.de` mailt — **kein Drittanbieter**
(kein Formspree/Netlify Forms).

## Was es macht

1. Das Formular auf `/kontakt` ([`src/pages/kontakt.astro`](../src/pages/kontakt.astro))
   schickt Name, E-Mail und Nachricht per `fetch` (JSON) an **`/api/kontakt`**
   (gleiche Domain → kein CORS).
2. Der Dienst validiert, prüft Honeypot + Rate-Limit und sendet:
   - **(1)** die Anfrage an Emi (`mail@designbyems.de`, `Reply-To` = Besucher),
   - **(2)** eine automatische Eingangsbestätigung an den Besucher (best-effort,
     **ohne** Signatur — Emi hat noch keine).
3. Bei Fehler zeigt das Formular einen sichtbaren `mailto:`-Fallback.

## Architektur

Der Dienst läuft im selben Stack wie Web + CMS und ist **nur über den internen
Caddy-Proxy** erreichbar. Der Proxy routet `/api/kontakt` an diesen Dienst —
**vor** der generischen `/api/*`-Regel, die ans CMS geht (sonst Kollision).

```
Browser ──POST /api/kontakt──▶ interner Caddy ──▶ form (Node :8080)
                                                      │ SMTP STARTTLS :587
                                                      ▼
                                          mail.your-server.de → mail@designbyems.de
```

## Konfiguration (Environment, in der Server-`.env`, NIE im Git)

| Variable | Wert | Hinweis |
|---|---|---|
| `SMTP_HOST` | `mail.your-server.de` | Hetzner-Mailserver |
| `SMTP_PORT` | **`587`** | STARTTLS — **NICHT 465** (Hetzner blockt ausgehend) |
| `SMTP_USER` | `mail@designbyems.de` | Postfach-Benutzer |
| `SMTP_PASS` | *(Postfach-Passwort)* | nur in der Server-`.env` |
| `MAIL_FROM` | `mail@designbyems.de` | Absender (= `SMTP_USER`) |
| `MAIL_TO`   | `mail@designbyems.de` | Empfänger der Anfragen |

Ohne `SMTP_*` fährt der Stack trotzdem hoch — der Dienst gibt dann sauber `502`
zurück (Frontend zeigt `mailto:`-Fallback).

## Spam-Schutz & Robustheit

- **Honeypot** (`firma`): gefüllt → still `200`, nichts senden.
- **Rate-Limit**: 5 Anfragen / 10 min pro IP (In-Memory, `X-Forwarded-For`).
- **Body-Limit** 20 KB, E-Mail-Format-Check, Pflichtfelder Name/E-Mail/Nachricht.
- **SMTP-Timeouts** → bei Mailproblemen zügiger `502` statt Hänger.
- **Auto-Reply ist best-effort**: ein Fehler dabei gefährdet die Hauptmail nicht.

## Schnelltest (vom Server)

```bash
# echte Test-Anfrage (löst Mail an mail@designbyems.de + Auto-Reply aus)
curl -s -X POST https://designbyems.de/api/kontakt \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"DEINE@gmail.com","nachricht":"Hallo"}'   # -> {"ok":true}

docker logs designbyems-contact --tail 30   # nur Fehler werden geloggt
```
