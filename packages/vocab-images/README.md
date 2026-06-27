# @edu/vocab-images

Ảnh từ điển minh họa — **file local** trong `media/`, serve qua `/media/...`.

## Setup

```bash
npm run media:setup
# = download + sync public + cập nhật DB imageUrl
```

| Lệnh | Mô tả |
|------|--------|
| `npm run media:download` | Tải OpenMoji, KanjiVG, ảnh kanji vnjpclub → `media/` |
| `npm run media:sync` | Copy → `apps/*/public/media/` |
| `npm run seed:vocab-images` | Ghi `/media/...` vào `Vocabulary` + `KanjiEntry` |

## Đường dẫn

| Loại | Local |
|------|--------|
| OpenMoji | `/media/openmoji/1F4D6.svg` |
| KanjiVG (nét viết) | `/media/kanjivg/04e00.svg` |
| Kanji mnemonic | `/media/kanji/kanji512/bai1/one.jpg` |

`resolveVocabImage()` và `toLocalImageUrl()` tự map URL CDN cũ sang local.
