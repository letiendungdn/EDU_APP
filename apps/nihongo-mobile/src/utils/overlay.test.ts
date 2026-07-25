import { describe, expect, it } from 'vitest';
import { mapOcrFrameToView } from './overlay';

describe('mapOcrFrameToView', () => {
  it('maps 1:1 when image matches view', () => {
    const mapped = mapOcrFrameToView(
      { left: 10, top: 20, width: 100, height: 40 },
      200,
      200,
      200,
      200,
    );
    expect(mapped).toEqual({ left: 10, top: 20, width: 100, height: 40 });
  });

  it('enforces minimum width of 48', () => {
    const mapped = mapOcrFrameToView(
      { left: 0, top: 0, width: 10, height: 10 },
      100,
      100,
      100,
      100,
    );
    expect(mapped.width).toBe(48);
    expect(mapped.height).toBe(10);
  });

  it('centers cropped cover-scale overlay', () => {
    // Image 200x100 into view 100x100 → scale=1 (max of 0.5, 1), offsetX=-50
    const mapped = mapOcrFrameToView(
      { left: 50, top: 10, width: 80, height: 20 },
      200,
      100,
      100,
      100,
    );
    expect(mapped.left).toBe(0); // 50*1 + (-50)
    expect(mapped.top).toBe(10);
    expect(mapped.width).toBe(80);
    expect(mapped.height).toBe(20);
  });
});
