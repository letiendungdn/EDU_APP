import { kanjivgStrokeFetchUrls } from '@edu/vocab-images';

const STROKE_BG_COLOR = '#f8fafc';
const STROKE_FG_COLOR = '#ef4444';
const STROKE_FALLBACK_TEXT_COLOR = '#f8fafc';

function extractSvgMarkup(svgText: string): string {
  const start = svgText.indexOf('<svg');
  if (start === -1) return svgText;
  const end = svgText.lastIndexOf('</svg>');
  if (end === -1) return svgText.slice(start);
  return svgText.slice(start, end + '</svg>'.length);
}

function styleFallbackCharDiv(charDiv: HTMLDivElement, char: string): void {
  charDiv.textContent = char;
  charDiv.style.fontSize = '3rem';
  charDiv.style.fontFamily = 'var(--font-jp)';
  charDiv.style.color = STROKE_FALLBACK_TEXT_COLOR;
}

function styleGuidePaths(paths: SVGPathElement[]): void {
  paths.forEach((path) => {
    path.style.stroke = STROKE_BG_COLOR;
    path.style.strokeWidth = '4';
    path.style.fill = 'none';
    path.style.strokeLinecap = 'round';
    path.style.strokeLinejoin = 'round';
  });
}

export async function fetchStrokeSvg(char: string): Promise<string> {
  const urls = kanjivgStrokeFetchUrls(char);

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.text();
    } catch {
      /* thử URL tiếp theo */
    }
  }

  throw new Error(`SVG not found for ${char}`);
}

export function mountKanjiVgSvg(
  charDiv: HTMLDivElement,
  char: string,
  svgText: string,
  width: number,
  height: number,
  onCharClick?: (char: string) => void,
): void {
  const svgWrapper = document.createElement('div');
  svgWrapper.innerHTML = extractSvgMarkup(svgText);
  svgWrapper.style.width = `${width}px`;
  svgWrapper.style.height = `${height}px`;
  svgWrapper.style.position = 'relative';

  const svgEl = svgWrapper.querySelector('svg');
  if (!svgEl) {
    styleFallbackCharDiv(charDiv, char);
    return;
  }

  svgEl.style.width = '100%';
  svgEl.style.height = '100%';

  const pathsGroup = svgEl.querySelector('[id*="StrokePaths"]');
  const numbersGroup = svgEl.querySelector('[id*="StrokeNumbers"]');

  if (!pathsGroup) {
    styleGuidePaths(Array.from(svgEl.querySelectorAll('path')));
    charDiv.style.cursor = 'pointer';
    charDiv.addEventListener('click', (e) => {
      e.stopPropagation();
      onCharClick?.(char);
    });
    charDiv.appendChild(svgWrapper);
    return;
  }

  const bgPaths = Array.from(pathsGroup.querySelectorAll('path'));
  styleGuidePaths(bgPaths);

  const fgPathsGroup = pathsGroup.cloneNode(true) as Element;
  const fgPaths = Array.from(fgPathsGroup.querySelectorAll('path'));

  fgPaths.forEach((path) => {
    path.style.stroke = STROKE_FG_COLOR;
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
      (el as SVGTextElement).style.fill = 'rgba(248, 250, 252, 0.55)';
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

export async function renderStrokeOrder(
  container: HTMLElement,
  writableText: string,
  width: number,
  height: number,
  onCharClick?: (char: string) => void,
): Promise<void> {
  container.innerHTML = '';

  if (!writableText) {
    container.innerHTML =
      '<p class="stroke-empty">Không có hướng dẫn viết cho mục này.</p>';
    return;
  }

  const chars = [...writableText];

  await Promise.all(
    chars.map(async (char) => {
      const charDiv = document.createElement('div');
      charDiv.style.display = 'inline-block';
      charDiv.style.margin = '0 5px';
      charDiv.style.color = STROKE_FALLBACK_TEXT_COLOR;
      container.appendChild(charDiv);

      try {
        const svgText = await fetchStrokeSvg(char);
        mountKanjiVgSvg(charDiv, char, svgText, width, height, () => onCharClick?.(char));
      } catch {
        styleFallbackCharDiv(charDiv, char);
        charDiv.style.cursor = 'pointer';
        charDiv.addEventListener('click', (e) => {
          e.stopPropagation();
          onCharClick?.(char);
        });
      }
    }),
  );
}
