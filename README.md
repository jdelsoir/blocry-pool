# Blocry Pool

A small, phone-first web app (installable PWA) that shows how many swimming lanes are open,
25m and 50m, at the Blocry pool in Louvain-la-Neuve, today and for the published weeks.

Live: https://jdelsoir.github.io/blocry-pool/

> **Unofficial.** This project is not affiliated with the pool or its operator. Figures are
> copied automatically from the published schedule and may be wrong or out of date. Always
> check the official page: https://csblocry.be/piscines/

## How data flows

1. The pool publishes its weekly lane schedule as a shared Excel workbook (one sheet per week).
2. Four times a day (06:17, 11:17, 16:17, 21:17 Brussels summer time, one hour earlier in
   winter) and on every push to `main`, the GitHub Actions workflow
   `.github/workflows/deploy.yml` runs:
   - `scripts/fetch_schedule.sh` downloads the workbook using the `SHEET_URL` secret.
   - `scripts/parse_schedule.py` turns it into `site/data/schedule.json`.
   - If the JSON changed (ignoring `generatedAt`), the bot commits it as `data: schedule update`.
   - If download or parsing fails, the last committed JSON is kept and the run only warns.
3. The deploy job stamps a fresh cache version into `site/sw.js`
   (`scripts/stamp_cache_version.py`) and publishes `site/` to GitHub Pages.
4. The app loads `data/schedule.json` network-first and falls back to its offline copy.

The workbook itself is never committed. Local copies live in `.local/` (gitignored).

## Run locally

```bash
python3 -m venv .local/venv
.local/venv/bin/pip install openpyxl pytest

# Download the workbook (the share link is not in the repo, export it in your shell only)
export SHEET_URL='<share link>'
scripts/fetch_schedule.sh .local/pool.xlsx

# Build the data file and run the tests
.local/venv/bin/python scripts/parse_schedule.py --in .local/pool.xlsx \
  --last-modified .local/pool.xlsx.last-modified --out site/data/schedule.json
.local/venv/bin/pytest

# Serve the site (open http://localhost:8000/)
python3 -m http.server 8000 -d site
```

`fetch_schedule.sh` writes the server's `Last-Modified` header, when present, to
`<output>.last-modified` next to the workbook.

## The `SHEET_URL` secret

The workflow needs one repository secret, `SHEET_URL`: the anonymous "anyone with the link"
share URL of the workbook. Set it under Settings > Secrets and variables > Actions, or:

```bash
gh secret set SHEET_URL
```

It is never written to the repo and never printed in logs. Without it, the workflow still
deploys the last committed data and shows a warning.

## Alerts

The `health` job (`scripts/health_check.py`) runs with the 06:17 and 16:17 updates and on manual
runs. It fails on purpose, so GitHub emails the repo owner (Settings > Notifications > Actions,
failed workflows), when:

- the workbook download or the parse failed,
- the parser reported a structural problem (skipped sheet, broken order, bad dates),
- this week's schedule is missing, or next week's is still missing after Friday 12:00 (Brussels),
- the workbook has not changed for more than 8 days.

The optional `NTFY_TOPIC` secret also pushes the reason to `https://ntfy.sh/<topic>`.
The site keeps deploying the last good data either way.

Pages must be configured with Settings > Pages > Source = "GitHub Actions".

## Service worker cache version

`site/sw.js` must declare its cache name with the literal placeholder:

```js
const CACHE = 'blocry-pool-__CACHE_VERSION__';
```

At deploy time `scripts/stamp_cache_version.py site --extra <commit sha>` replaces it with a
hash of the app shell and the commit, so each new commit rotates the cache and the worker's
`activate` handler drops the old one. Do not commit a stamped `sw.js`.

## Recovering from a stale or broken service worker

If users keep seeing an old or broken version after a deploy:

1. Replace the contents of `site/sw.js` with a kill-switch worker (the
   `kill-sw.js` template from the static-pwa-ghpages skill): on `install` it calls
   `skipWaiting()`, on `activate` it deletes every cache, unregisters itself and
   reloads open tabs, and it has no `fetch` handler.
2. Keep the same file name and URL (`sw.js`). Never rename or version the worker URL, or the
   old worker stays in control forever.
3. Push to `main` and wait up to about 10 minutes for Pages to serve the new file.
4. Once clients have recovered, restore the real `sw.js` (still at the same URL) and push again.

For a single device: open the site, then in the browser settings clear the site data for
`jdelsoir.github.io`, or in desktop Chrome use DevTools > Application > Service workers >
Unregister, then reload.

