'use client';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { Canvas } from 'fabric';

export type FabricCanvasHandle = {
  getCanvas: () => Canvas | null;
};

type Props = {
  width: number;
  height: number;
  className?: string;
  onReady?: (canvas: Canvas) => void;
};

const FabricCanvas = forwardRef<FabricCanvasHandle, Props>(
  ({ width, height, className, onReady }, ref) => {
    const elRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = useRef<Canvas | null>(null);

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
    }));

    useEffect(() => {
      if (!elRef.current) return;
      let canvas: Canvas;
      import('fabric').then(({ Canvas: FabricCanvasClass }) => {
        canvas = new FabricCanvasClass(elRef.current!, { width, height });
        canvasRef.current = canvas;
        onReady?.(canvas);
      });
      return () => {
        canvas?.dispose();
        canvasRef.current = null;
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <canvas ref={elRef} className={className} />;
  },
);

FabricCanvas.displayName = 'FabricCanvas';
export default FabricCanvas;
