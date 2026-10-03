#!/usr/bin/env bash
# Download the pool schedule workbook from its anonymous SharePoint share link.
#
# Usage: SHEET_URL=... scripts/fetch_schedule.sh OUTPUT.xlsx
#
# The share URL is read ONLY from the SHEET_URL environment variable (a GitHub
# Actions secret in CI). It is never printed. On success the workbook is written
# to OUTPUT.xlsx and, when the server sends one, the HTTP Last-Modified header is
# written to OUTPUT.xlsx.last-modified (the parser reads it via --last-modified).
# Exit codes: 0 ok, 2 usage or missing SHEET_URL, 3 download failed, 4 not a zip.
set -euo pipefail

out="${1:-}"
if [ -z "$out" ]; then
  echo "usage: SHEET_URL=... $0 OUTPUT.xlsx" >&2
  exit 2
fi
if [ -z "${SHEET_URL:-}" ]; then
  echo "error: SHEET_URL is not set" >&2
  exit 2
fi

# Keep the URL out of the process trace and out of any error message.
set +x

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
jar="$work/jar"
headers="$work/headers"
tmp="$work/download.xlsx"

ua="Mozilla/5.0"

# 1) Visit the share link once so SharePoint sets the anonymous guest cookie.
# curl's own messages can quote the host or URL, so only its exit code is shown.
rc=0
curl -sSL --fail --max-time 60 -A "$ua" -c "$jar" -b "$jar" \
  -o /dev/null "$SHEET_URL" 2>/dev/null || rc=$?
if [ "$rc" -ne 0 ]; then
  echo "error: share link request failed (curl exit $rc)" >&2
  exit 3
fi

# 2) Same URL with download=1 appended returns the raw workbook.
case "$SHEET_URL" in
  *\?*) dl="${SHEET_URL}&download=1" ;;
  *)    dl="${SHEET_URL}?download=1" ;;
esac

rc=0
curl -sSL --fail --max-time 120 -A "$ua" -c "$jar" -b "$jar" \
  -D "$headers" -o "$tmp" "$dl" 2>/dev/null || rc=$?
if [ "$rc" -ne 0 ]; then
  echo "error: workbook download failed (curl exit $rc)" >&2
  exit 3
fi

# 3) An xlsx is a zip archive: it must start with the bytes "PK".
magic="$(head -c 2 "$tmp" 2>/dev/null || true)"
if [ "$magic" != "PK" ]; then
  echo "error: downloaded file is not an xlsx (no zip signature, $(wc -c <"$tmp" | tr -d ' ') bytes)" >&2
  exit 4
fi

mkdir -p "$(dirname "$out")"
mv "$tmp" "$out"

# 4) Sidecar with the Last-Modified header of the final response, if present.
lm="$(tr -d '\r' <"$headers" | awk 'BEGIN{IGNORECASE=1} tolower($0) ~ /^last-modified:/ {sub(/^[^:]*:[ \t]*/, ""); v=$0} END{print v}')"
if [ -n "$lm" ]; then
  printf '%s\n' "$lm" >"$out.last-modified"
  echo "last-modified: $lm"
else
  rm -f "$out.last-modified"
  echo "last-modified: (not sent by server)"
fi

echo "ok: $(wc -c <"$out" | tr -d ' ') bytes written to $out"
