import re
from pathlib import Path

text = Path("packages/prisma-nihongo/book-audio.data.ts").read_text(encoding="utf-8")
urls = re.findall(r"https?://[^\s\"]+", text)
folders: set[str] = set()
files: set[str] = set()
for u in urls:
    m = re.search(r"/folders/([a-zA-Z0-9_-]+)", u)
    if m:
        folders.add(m.group(1))
        continue
    m = re.search(r"/file/d/([a-zA-Z0-9_-]+)", u)
    if m:
        files.add(m.group(1))
print("folders", len(folders), "files", len(files))
