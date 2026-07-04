# Tri Ngữ Translator — Chrome Extension

Bôi đen bất kỳ chữ nào trên web → hiện card dịch Việt–Anh–Nhật + phát âm + ví dụ trong câu.

## Cài và chạy

```bash
cd apps/translator-extension
npm install
npm run build       # xuất ra dist/
# hoặc
npm run dev         # watch mode, auto rebuild khi sửa
```

Load vào Chrome:
1. Mở `chrome://extensions`
2. Bật **Developer mode**
3. Click **Load unpacked** → chọn thư mục `dist/`

## Cài API Key

1. Click icon extension 🌐
2. Lấy key miễn phí tại https://aistudio.google.com/apikey
3. Dán vào ô và nhấn Lưu

## Cách dùng

- **Bôi đen** bất kỳ từ/câu trên bất kỳ trang web nào
- Card tự động hiện với 3 ngôn ngữ + phiên âm
- Click 🔈 để nghe phát âm (dùng Web Speech API)
- Click "Ví dụ trong câu" để xem 3 câu ví dụ với phát âm từng câu
- Nhấn **Escape** hoặc click ra ngoài để đóng

## Stack

- React 18 + TypeScript
- Vite + @crxjs/vite-plugin
- Gemini 2.0 Flash API
- Web Speech API (TTS không cần key)
- Shadow DOM (CSS không bị trang web ghi đè)
