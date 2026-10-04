# Blocry Pool

Unofficial PWA for the Blocry pool lane schedule. Live: https://jdelsoir.github.io/blocry-pool/ (repo `jdelsoir/blocry-pool`).
Full spec, data contract and Hard rules: `docs/SPEC.md` (read it before changing anything).

## Commands

```bash
python3 -m venv .local/venv && .local/venv/bin/pip install openpyxl pytest pillow
.local/venv/bin/python -m pytest -q
SHEET_URL='<share link>' scripts/fetch_schedule.sh .local/pool.xlsx      # link only in your shell
.local/venv/bin/python scripts/parse_schedule.py --in .local/pool.xlsx --out site/data/schedule.json
.local/venv/bin/python scripts/health_check.py --now 2026-10-09T16:30:00+02:00
python3 ~/.claude/skills/static-pwa-ghpages/scripts/ghpages_preflight.py site --repo-name blocry-pool
```

Serve under the real base path: a temp dir with a `blocry-pool` symlink to `site/`, then
`python3 -m http.server 8765` and open http://localhost:8765/blocry-pool/.

## Gotchas

- The share link contains a person's name: it lives only in the `SHEET_URL` Actions secret. `NTFY_TOPIC` is a secret too.
- CI commits `site/data/schedule.json` as github-actions[bot]: always `git pull --rebase` before pushing.
- Never change the manifest `name`, `id`, `start_url` or `scope` again: renaming after install left an Android WebAPK broken ("already installed" + "Could not open app").
- No em/en dashes and no personal names anywhere (code, UI, docs, commits).
- Headless Chrome clamps windows narrower than ~500px and does not exit after `--screenshot`: run it in the background and kill it.
- Cron runs are in UTC (`17 4,14` + `17 9,19`): 06:17 to 21:17 Brussels in summer, one hour earlier in winter. GitHub delays scheduled runs by hours and sometimes skips one: the health job runs on every scheduled and manual run and flags a gap over 15 h.
- `.local/` (gitignored) holds the workbook, the approved prototype and a venv. Never commit `.xlsx`.
