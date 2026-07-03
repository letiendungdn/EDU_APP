import type { OverlayLabel } from '../domain/entities';

export function mapOcrFrameToView(
  frame: { left: number; top: number; width: number; height: number },
  imageW: number,
  imageH: number,
  viewW: number,
  viewH: number,
): Pick<OverlayLabel, 'left' | 'top' | 'width' | 'height'> {
  const scale = Math.max(viewW / imageW, viewH / imageH);
  const offsetX = (viewW - imageW * scale) / 2;
  const offsetY = (viewH - imageH * scale) / 2;

  return {
    left: frame.left * scale + offsetX,
    top: frame.top * scale + offsetY,
    width: Math.max(frame.width * scale, 48),
    height: frame.height * scale,
  };
}
