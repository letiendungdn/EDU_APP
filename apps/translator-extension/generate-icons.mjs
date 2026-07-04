// Chạy một lần để tạo icons: node generate-icons.mjs
// Cần: npm install -D sharp  (hoặc dùng Inkscape/Figma thủ công)
//
// Nếu không muốn cài sharp, dùng icon emoji bất kỳ từ:
// https://favicon.io/emoji-favicons/globe-showing-asia-australia/

import { writeFileSync, mkdirSync } from 'fs';

// SVG source icon
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="24" fill="#16162a"/>
  <text x="64" y="88" font-size="72" text-anchor="middle" font-family="serif">🌐</text>
</svg>`;

mkdirSync('icons', { recursive: true });

// Nếu chỉ cần placeholder, dùng SVG trực tiếp
// Chrome chấp nhận SVG cho icons trong development
for (const size of [16, 48, 128]) {
  const sized = svg.replace('viewBox="0 0 128 128"', `viewBox="0 0 128 128" width="${size}" height="${size}"`);
  writeFileSync(`icons/icon${size}.svg`, sized);
  console.log(`Created icons/icon${size}.svg`);
}

console.log('\nĐổi manifest.json để dùng .svg:');
console.log('"icons": { "16": "icons/icon16.svg", "48": "icons/icon48.svg", "128": "icons/icon128.svg" }');
