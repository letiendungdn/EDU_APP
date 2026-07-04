import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import FloatingCard from './FloatingCard';

let root: Root | null = null;
let host: HTMLElement | null = null;

function removeCard() {
  if (!host) return;
  root?.unmount();
  host.remove();
  root = null;
  host = null;
}

function showCard(text: string, anchorX: number, anchorY: number) {
  removeCard();

  host = document.createElement('div');
  host.id = '__tri-ngu-root__';
  // Shadow DOM để CSS extension không bị override bởi trang web
  const shadow = host.attachShadow({ mode: 'open' });
  document.body.appendChild(host);

  // Inject stylesheet vào shadow root
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('content/index.css');
  shadow.appendChild(link);

  const mountPoint = document.createElement('div');
  shadow.appendChild(mountPoint);

  root = createRoot(mountPoint);
  root.render(
    <FloatingCard
      text={text}
      anchorX={anchorX}
      anchorY={anchorY}
      onClose={removeCard}
    />,
  );
}

// Detect text selection
document.addEventListener('mouseup', (e) => {
  // Ignore clicks inside our own card
  if (host?.contains(e.target as Node)) return;

  // Short delay để selection ổn định
  setTimeout(() => {
    const selected = window.getSelection()?.toString().trim() ?? '';
    if (!selected || selected.length > 300) {
      removeCard();
      return;
    }

    const range = window.getSelection()?.getRangeAt(0);
    if (!range) return;

    const rect = range.getBoundingClientRect();
    const x = rect.left + window.scrollX;
    const y = rect.bottom + window.scrollY + 10;

    showCard(selected, x, y);
  }, 20);
});

// Đóng khi click ra ngoài
document.addEventListener('mousedown', (e) => {
  if (host && !host.contains(e.target as Node)) removeCard();
});

// Đóng khi nhấn Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') removeCard();
});
