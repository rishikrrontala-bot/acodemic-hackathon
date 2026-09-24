#!/usr/bin/env bash
# Download every URL listed in data/sources.txt into data/raw/sources/ so the
# numbers the app cites can be checked against the original documents.
# Lines: <local-file-name> <url>. PDFs also get a pdftotext extract (*.txt).
set -u
cd "$(dirname "$0")/../.."
mkdir -p data/raw/sources
while read -r name url; do
  [ -z "${name:-}" ] && continue
  case "$name" in \#*) continue;; esac
  out="data/raw/sources/$name"
  if [ -s "$out" ]; then echo "have $name"; continue; fi
  code=$(curl -sSL -A "Mozilla/5.0 (X11; Linux x86_64) zeer-data-job" -o "$out" -w '%{http_code}' --max-time 120 "$url" || echo 000)
  size=$(stat -c %s "$out" 2>/dev/null || echo 0)
  echo "$code $size $name <- $url"
  if [ "$code" != "200" ] || [ "$size" -lt 200 ]; then rm -f "$out"; continue; fi
  if file "$out" | grep -q PDF; then pdftotext -layout "$out" "${out%.*}.txt" || true; fi
done < data/sources.txt
ls -la data/raw/sources
