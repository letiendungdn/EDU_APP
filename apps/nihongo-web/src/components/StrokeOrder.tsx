'use client';

import { useEffect, useRef } from 'react';
import { getStrokeText } from '../utils/japanese';

function extractSvgMarkup(svgText: string): string {
  const start = svgText.indexOf('<svg');
  if (start === -1) return svgText;
  const end = svgText.lastIndexOf('</svg>');
  if (end === -1) return svgText.slice(start);
  return svgText.slice(start, end + '</svg>'.length);
}

function kanjiVgUrl(char: string): string {
  const hex = char.charCodeAt(0).toString(16).padStart(5, '0');
  return `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;
}

function mountKanjiVgSvg(
  charDiv: HTMLDivElement,
  char: string,
  svgText: string,
  width: number,
  height: number,
  onCharClick?: (char: string) => void,
) {
  const svgWrapper = document.createElement('div');
  svgWrapper.innerHTML = extractSvgMarkup(svgText);
  svgWrapper.style.width = `${width}px`;
  svgWrapper.style.height = `${height}px`;
  svgWrapper.style.position = 'relative';

  const svgEl = svgWrapper.querySelector('svg');
  if (!svgEl) {
    charDiv.textContent = char;
    charDiv.style.fontSize = '3rem';
    charDiv.style.fontFamily = 'var(--font-jp)';
    return;
  }

  svgEl.style.width = '100%';
  svgEl.style.height = '100%';

  const pathsGroup = svgEl.querySelector('[id*="StrokePaths"]');
  const numbersGroup = svgEl.querySelector('[id*="StrokeNumbers"]');

  if (!pathsGroup) {
    charDiv.appendChild(svgWrapper);
    return;
  }

  const bgPaths = Array.from(pathsGroup.querySelectorAll('path'));
  bgPaths.forEach((path) => {
    path.style.stroke = '#334155';
    path.style.strokeWidth = '4';
    path.style.fill = 'none';
  });

  const fgPathsGroup = pathsGroup.cloneNode(true) as Element;
  const fgPaths = Array.from(fgPathsGroup.querySelectorAll('path'));

  fgPaths.forEach((path) => {
    path.style.stroke = '#ef4444';
    path.style.strokeWidth = '4';
    path.style.fill = 'none';
    path.style.strokeLinecap = 'round';
    path.style.strokeLinejoin = 'round';

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length + 1}`;
    path.style.strokeDashoffset = `${length + 1}`;
  });

  svgEl.appendChild(fgPathsGroup);

  if (numbersGroup) {
    Array.from(numbersGroup.querySelectorAll('text')).forEach((el) => {
      (el as SVGTextElement).style.fill = 'rgba(248, 250, 252, 0.4)';
    });
  }

  const animateStrokes = () => {
    fgPaths.forEach((path) => {
      path.style.transition = 'none';
      const length = path.getTotalLength();
      path.style.strokeDashoffset = `${length + 1}`;
    });

    svgEl.getBoundingClientRect();

    let delay = 0.5;
    fgPaths.forEach((path) => {
      path.style.transition = `stroke-dashoffset 0.6s ease-in-out ${delay}s`;
      path.style.strokeDashoffset = '0';
      delay += 0.8;
    });
  };

  charDiv.style.cursor = 'pointer';
  charDiv.addEventListener('click', (e) => {
    e.stopPropagation();
    animateStrokes();
    onCharClick?.(char);
  });

  charDiv.appendChild(svgWrapper);
  setTimeout(animateStrokes, 100);
}

interface Props {
  text: string;
  width?: number;
  height?: number;
  compact?: boolean;
  onCharClick?: (char: string, index: number) => void;
}

export default function StrokeOrder({
  text,
  width = 100,
  height = 100,
  compact = false,
  onCharClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCharClickRef = useRef(onCharClick);
  onCharClickRef.current = onCharClick;
  const writableText = getStrokeText(text);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    if (!writableText) {
      containerRef.current.innerHTML =
        '<p style="color: var(--text-secondary); font-size: 0.9rem;">Không có hướng dẫn viết cho mục này.</p>';
      return;
    }

    const chars = [...writableText];

    chars.forEach((char, index) => {
      const charDiv = document.createElement('div');
      charDiv.style.display = 'inline-block';
      charDiv.style.margin = '0 5px';
      containerRef.current?.appendChild(charDiv);

      const handleCharClick = () => onCharClickRef.current?.(char, index);

      fetch(kanjiVgUrl(char))
        .then((res) => {
          if (!res.ok) throw new Error('SVG not found');
          return res.text();
        })
        .then((svgText) =>
          mountKanjiVgSvg(charDiv, char, svgText, width, height, handleCharClick),
        )
        .catch(() => {
          charDiv.textContent = char;
          charDiv.style.fontSize = '3rem';
          charDiv.style.fontFamily = 'var(--font-jp)';
          charDiv.style.cursor = 'pointer';
          charDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            handleCharClick();
          });
        });
    });
  }, [writableText, width, height]);

  return (
    <div
      className="stroke-order-wrapper"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        ref={containerRef}
        className="stroke-order-container"
        title={onCharClick ? 'Nhấn vào chữ để xem lại và nghe phát âm' : 'Nhấn vào chữ để xem lại'}
      />
      {writableText && !compact && (
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginTop: '0.5rem',
          }}
        >
          {onCharClick
            ? '(Nhấn vào chữ để xem lại và nghe phát âm)'
            : '(Nhấn vào chữ để xem lại)'}
        </p>
      )}
    </div>
  );
}
