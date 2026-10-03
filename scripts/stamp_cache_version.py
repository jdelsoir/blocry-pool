#!/usr/bin/env python3
"""Rotate the service-worker cache version in site/sw.js for each deploy.

Adapted from the static-pwa-ghpages skill. Stdlib only. Run in CI right before
the Pages artifact upload (it edits sw.js in the runner checkout, never commit
the stamped file).

Convention in sw.js (keep it when editing the worker):

    const CACHE = 'blocry-pool-__CACHE_VERSION__';

The literal placeholder __CACHE_VERSION__ is replaced with a short content hash
of the app shell (every .html, .css, .js, .mjs, .webmanifest and .svg file under
the site directory, sw.js itself excluded, data/ excluded because schedule.json
is served network-first). Any shell change therefore rotates the cache name, and
the worker's activate handler deletes the old caches.

If the placeholder is missing (already stamped, or a worker written without it),
the script falls back to rewriting the version suffix of the first
`const CACHE... = '<prefix>-<version>'` declaration it finds. It fails loudly
when neither form is present so a deploy never ships an unrotated worker.

Usage: python3 scripts/stamp_cache_version.py [SITE_DIR] [--extra TEXT]
       SITE_DIR defaults to site/. --extra mixes TEXT (e.g. the commit sha)
       into the hash.
"""
import argparse
import hashlib
import os
import re
import sys

PLACEHOLDER = "__CACHE_VERSION__"
SHELL_EXT = (".html", ".css", ".js", ".mjs", ".webmanifest", ".svg")
SKIP_DIRS = {".git", "node_modules", "data"}
# const CACHE = 'name-abc123';  or  const CACHE_NAME = "name-v3";
FALLBACK_RE = re.compile(
    r"""(const\s+CACHE\w*\s*=\s*(['"]))([A-Za-z0-9_.]+(?:-[A-Za-z0-9_.]+)*?)-([A-Za-z0-9_.]+)(\2)"""
)


def shell_hash(root, extra):
    h = hashlib.sha256()
    files = []
    for dp, dns, fns in os.walk(root):
        dns[:] = sorted(d for d in dns if d not in SKIP_DIRS)
        for fn in fns:
            if fn.endswith(SHELL_EXT) and not (dp == root and fn == "sw.js"):
                files.append(os.path.join(dp, fn))
    for f in sorted(files):
        h.update(os.path.relpath(f, root).encode("utf-8"))
        with open(f, "rb") as fh:
            h.update(fh.read())
    if extra:
        h.update(extra.encode("utf-8"))
    return h.hexdigest()[:12], len(files)


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("site_dir", nargs="?", default="site")
    ap.add_argument("--extra", default="", help="extra text mixed into the hash")
    args = ap.parse_args()

    root = os.path.abspath(args.site_dir)
    sw = os.path.join(root, "sw.js")
    if not os.path.exists(sw):
        sys.exit("ERROR: sw.js not found in %s" % root)

    ver, nfiles = shell_hash(root, args.extra)
    with open(sw, encoding="utf-8") as fh:
        text = fh.read()

    n = text.count(PLACEHOLDER)
    if n:
        text = text.replace(PLACEHOLDER, ver)
        mode = "placeholder"
    else:
        text, n = FALLBACK_RE.subn(lambda m: m.group(1) + m.group(3) + "-" + ver + m.group(5), text, count=1)
        mode = "fallback"
        if not n:
            sys.exit("ERROR: no %s placeholder and no `const CACHE = '<name>-<version>'` in sw.js" % PLACEHOLDER)

    with open(sw, "w", encoding="utf-8") as fh:
        fh.write(text)
    if PLACEHOLDER in text:
        sys.exit("ERROR: placeholder still present")
    print("stamped sw.js cache version -> %s (%s, %d replacement%s, %d files hashed)"
          % (ver, mode, n, "" if n == 1 else "s", nfiles))


if __name__ == "__main__":
    main()
