#!/usr/bin/env python3
"""
Tải file nghe từ Google Drive (Mailee Books) về public/media/book-audio/
Cần: pip install gdown

  python scripts/download-book-audio-drive.py
  python scripts/download-book-audio-drive.py --limit 3
  python scripts/download-book-audio-drive.py --folder 1DAsTsy7gtVy6nob6TDmDZiyGhTZT7adR
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parents[1]
DATA_TS = ROOT / "packages/prisma-nihongo/book-audio.data.ts"
CSV_PATH = ROOT / "tmp-mailee.csv"
MEDIA_ROOT = ROOT / "apps/nihongo-web/public/media/book-audio"
MANIFEST_PATH = MEDIA_ROOT / "manifest.json"
SHEET_CSV_URL = (
    "https://docs.google.com/spreadsheets/d/"
    "1Sw5jK0dKAlUzFNKLrLl9L1xEsU_DmbdYj6RmsZxpSKs/export?format=csv&gid=0"
)

AUDIO_EXT = {".mp3", ".wma", ".wav", ".m4a", ".ogg", ".flac", ".aac"}


def load_book_audio_source() -> dict:
    text = DATA_TS.read_text(encoding="utf-8")
    m = re.search(r"export const BOOK_AUDIO_SOURCE = (\{[\s\S]+\}) as const;", text)
    if not m:
        raise SystemExit(f"Không parse được {DATA_TS}")
    return json.loads(m.group(1))


def parse_drive(url: str) -> tuple[str | None, str]:
    folder = re.search(r"/folders/([a-zA-Z0-9_-]+)", url)
    if folder:
        return folder.group(1), "folder"
    file_ = re.search(r"/file/d/([a-zA-Z0-9_-]+)", url)
    if file_:
        return file_.group(1), "file"
    return None, "external"


def collect_targets(source: dict) -> dict[str, dict]:
    folders: dict[str, dict] = {}
    files: dict[str, dict] = {}
    for section in source["sections"]:
        for item in section["items"]:
            drive_id, kind = parse_drive(item["url"])
            if not drive_id:
                continue
            if kind == "folder":
                folders.setdefault(
                    drive_id,
                    {"driveId": drive_id, "titles": set(), "url": item["url"]},
                )["titles"].add(item["title"])
            elif kind == "file":
                files.setdefault(
                    drive_id,
                    {"driveId": drive_id, "titles": set(), "url": item["url"]},
                )["titles"].add(item["title"])
    return {"folders": folders, "files": files}


def run_gdown_folder(drive_id: str, dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    url = f"https://drive.google.com/drive/folders/{drive_id}"
    subprocess.run(
        ["gdown", "--folder", url, "-O", str(dest)],
        check=True,
    )


def run_gdown_file(drive_id: str, dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    url = f"https://drive.google.com/uc?id={drive_id}"
    subprocess.run(
        ["gdown", url, "-O", str(dest)],
        check=True,
    )


def scan_audio_files(base: Path, public_prefix: str) -> list[dict]:
    rows: list[dict] = []
    if not base.exists():
        return rows
    for i, path in enumerate(sorted(base.rglob("*"))):
        if not path.is_file():
            continue
        if path.suffix.lower() not in AUDIO_EXT and path.suffix.lower() not in {
            ".pdf",
            ".zip",
        }:
            continue
        rel = path.relative_to(ROOT / "apps/nihongo-web/public")
        rows.append(
            {
                "fileName": path.name,
                "localPath": "/" + rel.as_posix(),
                "mimeType": None,
                "sizeBytes": path.stat().st_size,
                "sortOrder": i,
            }
        )
    return rows


def fetch_csv() -> None:
    import urllib.request

    print(f"Download CSV -> {CSV_PATH}")
    urllib.request.urlretrieve(SHEET_CSV_URL, CSV_PATH)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="Giới hạn số folder/file tải")
    parser.add_argument("--folder", type=str, help="Chỉ tải 1 folder id")
    parser.add_argument("--fetch-csv", action="store_true", help="Tải lại tmp-mailee.csv")
    args = parser.parse_args()

    if args.fetch_csv:
        fetch_csv()
        subprocess.run([sys.executable, str(ROOT / "scripts/parse-mailee-book-audio.py")], check=True)
    elif not DATA_TS.exists():
        fetch_csv()
        subprocess.run([sys.executable, str(ROOT / "scripts/parse-mailee-book-audio.py")], check=True)

    source = load_book_audio_source()
    targets = collect_targets(source)
    manifest: dict = {"updatedAt": None, "folders": {}, "files": {}}
    if MANIFEST_PATH.exists():
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))

    folder_ids = list(targets["folders"].keys())
    file_ids = list(targets["files"].keys())
    if args.folder:
        folder_ids = [args.folder]
        file_ids = []
    if args.limit > 0:
        folder_ids = folder_ids[: args.limit]
        file_ids = file_ids[: max(0, args.limit - len(folder_ids))]

    print(f"Download {len(folder_ids)} folders + {len(file_ids)} files -> {MEDIA_ROOT}")

    for drive_id in folder_ids:
        dest = MEDIA_ROOT / "folders" / drive_id
        meta = targets["folders"][drive_id]
        print(f"\n[folder] {drive_id}")
        try:
            run_gdown_folder(drive_id, dest)
            audio = scan_audio_files(dest, f"/media/book-audio/folders/{drive_id}")
            manifest["folders"][drive_id] = {
                "driveId": drive_id,
                "localPath": f"/media/book-audio/folders/{drive_id}",
                "fileCount": len(audio),
                "downloadedAt": datetime.now(timezone.utc).isoformat(),
                "files": audio,
            }
            print(f"  OK {len(audio)} files")
        except subprocess.CalledProcessError as e:
            print(f"  FAIL folder {drive_id}: {e}")

    for drive_id in file_ids:
        dest = MEDIA_ROOT / "files" / drive_id
        meta = targets["files"][drive_id]
        print(f"\n[file] {drive_id}")
        try:
            run_gdown_file(drive_id, dest)
            scanned = scan_audio_files(dest, f"/media/book-audio/files/{drive_id}")
            manifest["files"][drive_id] = {
                "driveId": drive_id,
                "localPath": f"/media/book-audio/files/{drive_id}",
                "fileCount": len(scanned),
                "downloadedAt": datetime.now(timezone.utc).isoformat(),
                "files": scanned,
            }
            print(f"  OK {len(scanned)} files")
        except subprocess.CalledProcessError as e:
            print(f"  FAIL file {drive_id}: {e}")

    manifest["updatedAt"] = datetime.now(timezone.utc).isoformat()
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nManifest → {MANIFEST_PATH}")


if __name__ == "__main__":
    main()
