#!/usr/bin/env python3
"""Health check for the schedule pipeline.

Exits 1 (so the GitHub Actions run fails and GitHub emails the repo owner) when:
  - the workbook download or the parse failed in this run,
  - the parser reported a structural problem (skipped sheet, broken order, bad dates),
  - next week's schedule is still missing after the Friday noon deadline (Brussels time),
  - the source workbook has not changed for more than STALE_DAYS days.

Writes a one-line reason per problem to --report (used for the ntfy alert).
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
from zoneinfo import ZoneInfo

TZ = ZoneInfo("Europe/Brussels")
DEADLINE_WEEKDAY = 4  # Friday
DEADLINE_HOUR = 12
STALE_DAYS = 8
STRUCTURAL = ("skipped", "order broken", "parse error", "not a monday", "far from", "far ahead", "grid has")


def check(data: dict | None, now: dt.datetime, fetch_ok: bool, parse_ok: bool) -> list[str]:
    problems: list[str] = []
    if not fetch_ok:
        problems.append("Workbook download failed (link changed, SharePoint blocked, or not an xlsx).")
    elif not parse_ok:
        problems.append("Workbook downloaded but the parser failed (no week found for the current window).")
    if data is None:
        problems.append("site/data/schedule.json is missing or not valid JSON.")
        return problems

    for w in data.get("warnings", []):
        msg = str(w.get("msg", ""))
        if any(k in msg.lower() for k in STRUCTURAL):
            problems.append(f"Parser warning on sheet {w.get('sheet')!r}: {msg}")

    today = now.date()
    monday = today - dt.timedelta(days=today.weekday())
    next_monday = monday + dt.timedelta(days=7)
    starts = {w.get("start") for w in data.get("weeks", [])}
    deadline = dt.datetime.combine(monday + dt.timedelta(days=DEADLINE_WEEKDAY), dt.time(DEADLINE_HOUR), TZ)
    if now >= deadline and next_monday.isoformat() not in starts:
        problems.append(f"Next week's schedule (week of {next_monday.isoformat()}) is not published yet.")
    if monday.isoformat() not in starts:
        problems.append(f"This week's schedule (week of {monday.isoformat()}) is missing.")

    lm = (data.get("source") or {}).get("lastModified")
    if lm:
        try:
            changed = dt.datetime.fromisoformat(lm.replace("Z", "+00:00"))
            age = now - changed
            if age > dt.timedelta(days=STALE_DAYS):
                problems.append(f"Source workbook unchanged for {age.days} days (last change {lm}).")
        except ValueError:
            pass
    return problems


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--data", default="site/data/schedule.json")
    ap.add_argument("--fetch-ok", default="true")
    ap.add_argument("--parse-ok", default="true")
    ap.add_argument("--now", help="ISO datetime override, for tests")
    ap.add_argument("--report", help="write problems, one per line, to this file")
    a = ap.parse_args(argv)

    now = dt.datetime.fromisoformat(a.now).astimezone(TZ) if a.now else dt.datetime.now(TZ)
    try:
        with open(a.data, encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, ValueError):
        data = None

    problems = check(data, now, a.fetch_ok == "true", a.parse_ok == "true")
    if a.report:
        with open(a.report, "w", encoding="utf-8") as fh:
            fh.write("\n".join(problems))
    if problems:
        for p in problems:
            print(f"::error::{p}")
        return 1
    print("Schedule pipeline healthy.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
