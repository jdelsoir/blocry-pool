import datetime as dt
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from health_check import TZ, check  # noqa: E402


def data(starts, last_modified="2026-10-03T07:52:06Z", warnings=()):
    return {"weeks": [{"start": s} for s in starts], "source": {"lastModified": last_modified}, "warnings": list(warnings)}


def at(iso):
    return dt.datetime.fromisoformat(iso).astimezone(TZ)


def test_healthy_midweek():
    assert check(data(["2026-09-28", "2026-10-05"]), at("2026-10-01T10:00:00+02:00"), True, True) == []


def test_next_week_missing_after_friday_noon():
    p = check(data(["2026-09-28"]), at("2026-10-02T12:30:00+02:00"), True, True)
    assert any("2026-10-05" in x for x in p)


def test_next_week_missing_before_deadline_is_fine():
    assert check(data(["2026-09-28"]), at("2026-10-02T11:00:00+02:00"), True, True) == []


def test_fetch_and_parse_failures():
    assert check(data(["2026-09-28"]), at("2026-10-01T10:00:00+02:00"), False, False)
    assert check(data(["2026-09-28"]), at("2026-10-01T10:00:00+02:00"), True, False)


def test_structural_warning_but_not_cell_warning():
    w = [{"sheet": "X", "msg": "skipped: no 25m/50m grid found"}]
    assert check(data(["2026-09-28"], warnings=w), at("2026-10-01T10:00:00+02:00"), True, True)
    w = [{"sheet": "X", "msg": "suspect: 18 x 25m + 2 x 50m exceeds 10 lanes"}]
    assert check(data(["2026-09-28"], warnings=w), at("2026-10-01T10:00:00+02:00"), True, True) == []


def test_stale_source():
    p = check(data(["2026-09-28"], last_modified="2026-09-20T07:00:00Z"), at("2026-10-01T10:00:00+02:00"), True, True)
    assert any("unchanged" in x for x in p)


def test_missing_data_file():
    assert check(None, at("2026-10-01T10:00:00+02:00"), True, True)


def test_previous_run_gap():
    d, now = data(["2026-09-28"]), at("2026-10-01T10:00:00+02:00")
    assert check(d, now, True, True, "2026-09-30T19:20:00Z") == []
    p = check(d, now, True, True, "2026-09-30T14:20:00Z")
    assert any("late or skipped" in x for x in p)
    assert check(d, now, True, True, "not a date") == []
