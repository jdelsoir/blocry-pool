## Session 2026-10-03

## State

- Live at https://jdelsoir.github.io/blocry-pool/ (v2): Home (today), Agenda, Semaine, About; FR/EN; Auto/Light/Dark theme; pool plan; offline PWA.
- Parser reads all 76 sheets (72 dated, 4 junk/template skipped); 72 pytest tests green.
- GitHub Action: data refresh 4x/day, deploy on change or push, health job (download/parse failure, structural warnings, missing current week, next week missing after Friday 12:00, workbook stale > 8 days) that fails on purpose (GitHub email) and pushes to ntfy.
- Secrets set: `SHEET_URL`, `NTFY_TOPIC`. Pages source = GitHub Actions.

## Decisions

- Data shown as-is up to 10 physical lanes (pool PDF: 10 x 50m or 10 + 10 short lanes); only `ceil(l25/2) + l50 > 10` is flagged suspect. User usually sees 8 x 50m or 16 x 25m.
- Pool plan: 10 rows, 50m on top, 25m fill the right side of the pontoon first (public side).
- Brand look borrowed from csblocry.be (Exo 2, Teko, Open Sans, blue/magenta/orange) but no logo or photos: hobby project, clearly marked unofficial.
- Lane-count filter removed; filtered sessions are hidden, not greyed.
- First run of the day before the pool opens (06:17 Brussels summer time).
- Alerts via failing workflow + ntfy instead of SMTP (no mail credentials needed).

## Open questions

- Android install: "already installed" + "Could not open app" after the manifest rename. Server side verified clean (no installability errors, SW active, unique app id). Waiting for the user to uninstall, reset jdelsoir.github.io site data in Chrome and reinstall; if it persists, collect Android/Chrome version, work profile, browser used.
- Friday 12:00 deadline for next week's sheet is a guess; adjust `DEADLINE_*` in `scripts/health_check.py` if the pool publishes later.
- Confirm GitHub notification setting "Actions: failed workflows" is on so health alerts reach email.

## Next steps

- Follow up on the Android install result.
- Bump `actions/checkout` and `actions/setup-python` to Node 24 versions when available (deprecation warnings in runs).
- Watch the first Friday health run (2026-10-09 16:17 Brussels) for false alarms.
