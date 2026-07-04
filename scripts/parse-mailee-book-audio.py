#!/usr/bin/env python3
"""Parse Mailee Books spreadsheet CSV into book-audio.data.ts"""
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "tmp-mailee.csv"
OUT_TS = ROOT / "packages/prisma-nihongo/book-audio.data.ts"
SHEET_CSV_URL = (
    "https://docs.google.com/spreadsheets/d/"
    "1Sw5jK0dKAlUzFNKLrLl9L1xEsU_DmbdYj6RmsZxpSKs/export?format=csv&gid=0"
)


def parse_row(cells: list[str], sort_order: int) -> dict | None:
    cells = [c.strip() for c in cells]
    num_idx = None
    for i, c in enumerate(cells):
        if c.isdigit() and int(c) < 200:
            num_idx = i
            break

    title = ""
    url = ""
    note = ""
    no = None

    if num_idx is not None:
        no = int(cells[num_idx])
        for c in cells[num_idx + 1 :]:
            if c.startswith("http"):
                url = c
            elif not title and c:
                title = c
            elif url and c:
                note = c
    else:
        for c in cells:
            if c.startswith("http"):
                url = c
            elif not title and c and not c.upper().startswith("STT"):
                title = c
            elif url and c:
                note = c

    if title and url:
        return {
            "no": no,
            "title": title,
            "url": url,
            "note": note or None,
            "sortOrder": sort_order,
        }
    return None


def main() -> None:
    if not CSV_PATH.exists():
        import urllib.request
        print(f"Downloading {SHEET_CSV_URL}")
        urllib.request.urlretrieve(SHEET_CSV_URL, CSV_PATH)

    text = CSV_PATH.read_text(encoding="utf-8-sig")
    rows = list(csv.reader(text.splitlines()))
    sections: list[dict] = []
    current: dict | None = None
    counter = 0

    for row in rows:
        cells = [c.strip() for c in row]
        joined = " ".join(c for c in cells if c)
        m = re.search(
            r"FILE (?:NGHE CÁC ĐẦU SÁCH (?:CẤP ĐỘ\s+(N[1-5])|KHÁC)|ĐÁP ÁN CÁC ĐẦU SÁCH MINANO SƠ CẤP 1,2)",
            joined,
            re.I,
        )
        if m:
            if m.group(1):
                level = m.group(1).upper()
            elif "ĐÁP ÁN" in joined.upper():
                level = "ANSWERS"
            else:
                level = "OTHER"
            current = {"level": level, "items": []}
            sections.append(current)
            continue

        if not current:
            continue
        if "STT" in joined and "TÊN SÁCH" in joined:
            continue

        item = parse_row(cells, counter)
        if item:
            counter += 1
            current["items"].append(item)

    payload = {
        "sourceUrl": "https://docs.google.com/spreadsheets/d/1Sw5jK0dKAlUzFNKLrLl9L1xEsU_DmbdYj6RmsZxpSKs",
        "publisher": "Nhà sách Mailee Books",
        "sections": sections,
    }

    ts = (
        "/** File nghe sách — nguồn: Mailee Books Google Sheet */\n"
        "export const BOOK_AUDIO_SOURCE = "
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + " as const;\n"
    )
    OUT_TS.write_text(ts, encoding="utf-8")
    print(f"Wrote {OUT_TS} — {counter} items in {len(sections)} sections")


if __name__ == "__main__":
    main()
