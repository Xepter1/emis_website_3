/*
 * Emi / EMS Design — Kontaktformular-Dienst
 * -----------------------------------------
 * Winziger, selbst gehosteter Endpunkt (kein Drittanbieter). Nimmt das
 * Kontaktformular von designbyems.de per POST entgegen, prüft es und schickt die
 * Anfrage per SMTP an Emis Postfach. Antwort-Adresse = die des Besuchers, damit
 * Emi direkt antworten kann.
 *
 * Läuft im SELBEN Stack wie Web + CMS und ist NUR über den internen Caddy-Proxy
 * erreichbar (Route /api/kontakt → dieser Dienst). Dadurch same-origin → kein
 * CORS nötig. Bewusst ohne Web-Framework (nur Node + nodemailer) → minimale
 * Angriffsfläche.
 *
 * Konfiguration ausschließlich über Environment-Variablen (im Server-Stack/.env
 * gesetzt, NIE im Git):
 *   PORT          Listen-Port im Container            (default 8080)
 *   SMTP_HOST     z. B. mail.your-server.de           (Hetzner-Mail)
 *   SMTP_PORT     587 (STARTTLS) oder 465 (SSL)       (default 587)
 *   SMTP_USER     Postfach-Benutzer, z. B. mail@designbyems.de
 *   SMTP_PASS     Postfach-Passwort / App-Passwort
 *   MAIL_FROM     Absender, sollte = SMTP_USER sein   (default = SMTP_USER)
 *   MAIL_TO       Empfänger der Anfragen              (default = SMTP_USER)
 */

import http from 'node:http'
import nodemailer from 'nodemailer'

const PORT = Number(process.env.PORT || 8080)
const SMTP_HOST = process.env.SMTP_HOST || ''
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_USER = process.env.SMTP_USER || ''
const SMTP_PASS = process.env.SMTP_PASS || ''
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER
const MAIL_TO = process.env.MAIL_TO || SMTP_USER

const MAX_BODY = 20 * 1024 // 20 KB reichen für ein Kontaktformular dicke
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Ein wiederverwendbarer SMTP-Transport (Connection-Pool).
// Hinweis: Hetzner Cloud blockiert ausgehend oft Port 465 → 587 (STARTTLS) nutzen.
const SMTP_SECURE = SMTP_PORT === 465 // 465 = implizites TLS, 587 = STARTTLS
const transporter = nodemailer.createTransport({
  host: SMTP_HOST.replace(/\.$/, ''), // evtl. versehentlichen FQDN-Punkt entfernen
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  requireTLS: !SMTP_SECURE, // bei 587 STARTTLS erzwingen (kein Klartext-Login)
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  pool: true,
  maxConnections: 2,
  connectionTimeout: 10000, // nicht ewig hängen bleiben …
  greetingTimeout: 10000,
  socketTimeout: 15000, // … sondern zügig einen 502 zurückgeben
})

// --- simple In-Memory-Rate-Limit pro IP (5 Anfragen / 10 Min) ---
const HITS = new Map()
const WINDOW_MS = 10 * 60 * 1000
const MAX_HITS = 5
function rateLimited(ip) {
  const now = Date.now()
  const list = (HITS.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  list.push(now)
  HITS.set(ip, list)
  return list.length > MAX_HITS
}

function clientIp(req) {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.length) return xff.split(',')[0].trim()
  return req.socket.remoteAddress || 'unknown'
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj)
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(body)
}

function esc(s) {
  return String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))
}

// Eingangsbestätigung an den Absender. Emi hat (noch) KEINE E-Mail-Signatur —
// daher ein schlichter, freundlicher Textabschluss statt einer Signatur-Grafik.
// Tonfall „du" passt zur Kontakt-Überschrift („Erzähl mir von deiner Vision").
// Auf „Sie" umstellen: hier + im Text-Pendant die Anrede tauschen.
function buildAutoReplyHtml(name, message) {
  return `<!doctype html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;font-size:15px;line-height:1.7;max-width:560px;margin:0 auto;padding:28px 24px;">
  <p style="margin:0 0 16px;">Hallo ${esc(name)},</p>
  <p style="margin:0 0 16px;">vielen Dank f&uuml;r deine Nachricht &mdash; sie ist bei mir angekommen. Ich melde mich so bald wie m&ouml;glich pers&ouml;nlich bei dir.</p>
  <p style="margin:0 0 6px;color:#6b6b6b;font-size:13px;">Das hast du mir geschrieben:</p>
  <blockquote style="margin:0 0 22px;padding:10px 16px;border-left:2px solid #1a1a1a;color:#3a3a3a;font-size:14px;white-space:pre-wrap;">${esc(message)}</blockquote>
  <p style="margin:0 0 24px;">Bis bald,<br>Emi</p>
  <div style="border-top:1px solid #e2e2e2;padding-top:14px;font-size:13px;color:#6b6b6b;">
    <strong style="color:#1a1a1a;">Emi</strong> &middot; EMS Design &middot; Grafikdesignerin<br>
    <a href="mailto:mail@designbyems.de" style="color:#1a1a1a;">mail@designbyems.de</a> &middot;
    <a href="https://designbyems.de" style="color:#1a1a1a;">designbyems.de</a>
  </div>
</div>
</body></html>`
}

function buildAutoReplyText(name, message) {
  return `Hallo ${name},

vielen Dank für deine Nachricht — sie ist bei mir angekommen.
Ich melde mich so bald wie möglich persönlich bei dir.

Das hast du mir geschrieben:
${message}

Bis bald,
Emi

—
Emi · EMS Design · Grafikdesignerin
mail@designbyems.de · https://designbyems.de`
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')

  // Health-Check (für Container-/Uptime-Prüfung; intern, nicht öffentlich geroutet)
  if (req.method === 'GET' && url.pathname === '/healthz') {
    return sendJson(res, 200, { ok: true })
  }

  if (req.method !== 'POST' || url.pathname !== '/api/kontakt') {
    return sendJson(res, 404, { ok: false, error: 'not_found' })
  }

  const ip = clientIp(req)
  if (rateLimited(ip)) {
    return sendJson(res, 429, { ok: false, error: 'rate_limited' })
  }

  let raw = ''
  let tooBig = false
  req.on('data', (chunk) => {
    raw += chunk
    if (raw.length > MAX_BODY) {
      tooBig = true
      req.destroy()
    }
  })
  req.on('end', async () => {
    if (tooBig) return sendJson(res, 413, { ok: false, error: 'too_large' })

    let data
    try {
      data = JSON.parse(raw || '{}')
    } catch {
      return sendJson(res, 400, { ok: false, error: 'bad_json' })
    }

    // Honeypot: echtes Formular lässt "firma" leer. Bot füllt es → still 200,
    // aber NICHTS senden.
    if (data.firma) return sendJson(res, 200, { ok: true })

    const name = String(data.name || '').trim()
    const email = String(data.email || '').trim()
    const message = String(data.nachricht || data.message || '').trim()

    if (!name || !email || !message) {
      return sendJson(res, 422, { ok: false, error: 'missing_fields' })
    }
    if (!EMAIL_RE.test(email)) {
      return sendJson(res, 422, { ok: false, error: 'bad_email' })
    }

    const text =
      `Neue Anfrage über designbyems.de\n\n` +
      `Name:   ${name}\n` +
      `E-Mail: ${email}\n\n` +
      `Nachricht:\n${message}\n`

    const html =
      `<h2 style="font-family:sans-serif">Neue Anfrage über designbyems.de</h2>` +
      `<p style="font-family:sans-serif"><b>Name:</b> ${esc(name)}<br>` +
      `<b>E-Mail:</b> ${esc(email)}</p>` +
      `<p style="font-family:sans-serif;white-space:pre-wrap">${esc(message)}</p>`

    try {
      // 1) Die wichtige Mail: Anfrage an Emi. Scheitert die → 502.
      await transporter.sendMail({
        from: MAIL_FROM,
        to: MAIL_TO,
        replyTo: `${name} <${email}>`,
        subject: `[designbyems.de] Anfrage von ${name}`,
        text,
        html,
      })

      // 2) Best-Effort: Eingangsbestätigung an den Absender. Ein Fehler hier darf
      //    die erfolgreiche Anfrage an Emi NICHT zunichtemachen → nur loggen.
      try {
        await transporter.sendMail({
          from: MAIL_FROM,
          to: email,
          replyTo: MAIL_TO,
          subject: 'Deine Anfrage ist angekommen — EMS Design',
          text: buildAutoReplyText(name, message),
          html: buildAutoReplyHtml(name, message),
        })
      } catch (err) {
        console.error('[contact] auto-reply failed:', err?.message || err)
      }

      return sendJson(res, 200, { ok: true })
    } catch (err) {
      console.error('[contact] sendMail failed:', err?.message || err)
      return sendJson(res, 502, { ok: false, error: 'mail_failed' })
    }
  })
})

server.listen(PORT, () => {
  console.log(`[contact] listening on :${PORT} — Route /api/kontakt`)
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[contact] ⚠ SMTP_HOST/SMTP_USER/SMTP_PASS nicht gesetzt — Mailversand wird scheitern.')
  }
})
