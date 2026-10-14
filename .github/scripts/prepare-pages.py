#!/usr/bin/env python3
"""Prepare only reviewed static demo files for GitHub Pages. No dependencies."""

import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess


def main():
    root = Path(__file__).resolve().parents[2]
    output = root / "_site"
    manifest = root / ".github/pages-files.txt"
    files = [line.strip() for line in manifest.read_text(encoding="utf-8").splitlines()
             if line.strip() and not line.lstrip().startswith("#")]
    if len(files) != len(set(files)) or "index.html" not in files:
        raise ValueError("Duplicate paths or missing index.html in Pages manifest.")
    allowed_extensions = {".html", ".css", ".js", ".jpg", ".png", ".webp", ".svg", ".ttf", ".woff2"}
    exceptions = {".nojekyll", "robots.txt", "assets/FONT_LICENSE.txt"}
    hashes = {}
    for relative in files:
        path = Path(relative)
        if (path.is_absolute() or ".." in path.parts or
                (len(path.parts) > 1 and path.parts[0] != "assets") or
                (relative not in exceptions and path.suffix not in allowed_extensions)):
            raise ValueError("Non-website file in Pages manifest: " + relative)
        source = root / path
        if source.is_symlink() or source.resolve().parent not in {root, root / "assets"}:
            raise ValueError("Unsafe source path: " + relative)
        if not source.is_file():
            raise FileNotFoundError("Missing Pages file: " + relative)
        hashes[relative] = hashlib.sha256(source.read_bytes()).hexdigest()

    # Fail instead of silently publishing an unexpected file from an earlier run.
    if output.is_symlink():
        raise ValueError("_site must not be a symlink.")
    if output.exists():
        for path in output.rglob("*"):
            if path.is_symlink():
                raise ValueError("Symlink in _site: " + str(path))
            if path.is_file() and path.relative_to(output).as_posix() not in set(files) | {"deployment.json"}:
                raise ValueError("Unexpected file in _site: " + str(path))
    output.mkdir(exist_ok=True)
    for relative in files:
        target = output / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(root / relative, target)

    commit = os.environ.get("GITHUB_SHA", "")
    if not commit:
        result = subprocess.run(["git", "rev-parse", "HEAD"], cwd=root, capture_output=True, text=True)
        commit = result.stdout.strip() if result.returncode == 0 else "local-preview"
    if commit != "local-preview" and not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise ValueError("Invalid commit SHA.")
    metadata = {"project": "Candan Cana", "mode": "mock-demo", "commit": commit, "sha256": hashes}
    (output / "deployment.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(path.stat().st_size for path in output.rglob("*") if path.is_file())
    print("Prepared %d static files + deployment.json (%d bytes)." % (len(files), total))
    print("Only manifest files are published; local documents and evidence are excluded.")


if __name__ == "__main__":
    main()
