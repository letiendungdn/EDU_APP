'use client';

import { useEffect, useRef, useState } from 'react';

/** Ẩn header khi cuộn xuống, hiện lại khi cuộn lên hoặc gần đầu trang. */
export function useAutoHideHeader(enabled = true, scrollDelta = 10, topReveal = 48) {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setHidden(false);
      return;
    }

    const update = () => {
      ticking.current = false;
      const y = window.scrollY;

      if (y <= topReveal) {
        setHidden(false);
      } else if (y > lastScrollY.current + scrollDelta) {
        setHidden(true);
      } else if (y < lastScrollY.current - scrollDelta) {
        setHidden(false);
      }

      lastScrollY.current = y;
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [enabled, scrollDelta, topReveal]);

  return hidden;
}
