# Mini-Proxy mit fest eingebackenem Caddyfile.
#
# WARUM kein Bind-Mount der Datei mehr (./proxy/Caddyfile:/etc/caddy/Caddyfile)?
# Bei Portainer-Git-Stacks legte Docker an der Mount-Stelle
# (/data/compose/<id>/proxy/Caddyfile) ein leeres VERZEICHNIS an, sobald die
# Datei beim ersten Start auch nur kurz fehlte. Danach scheiterte JEDER weitere
# Start mit „not a directory" (man kann kein Verzeichnis auf eine Datei mounten)
# – eine Endlosschleife, die sich nur durch Löschen des Ordners brechen ließ.
#
# Durch COPY ins Image gibt es keinen fragilen Single-File-Mount mehr: Das
# Caddyfile ist Teil des Images, Portainer baut es beim Deploy aus dem Repo.
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
