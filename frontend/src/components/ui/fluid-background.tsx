"use client";

import React, { useEffect, useRef } from "react";

interface FluidBackgroundProps {
  opacity?: string;
  blur?: string;
}

export default function FluidBackground({
  opacity = "opacity-[0.25]",
  blur = "50px",
}: FluidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const palette = [
      [0, 9, 8, 7],
      [0.32, 58, 24, 8],
      [0.52, 122, 45, 10],
      [0.63, 234, 88, 12],
      [0.78, 240, 205, 165],
      [1, 246, 240, 227]
    ];

    const colorMap = new Uint8ClampedArray(768);
    for (let e = 0; e < 256; e++) {
      const n = e / 255;
      let s = palette[0], i = palette[palette.length - 1];
      for (let c = 0; c < palette.length - 1; c++) {
        if (n >= palette[c][0] && n <= palette[c + 1][0]) {
          s = palette[c];
          i = palette[c + 1];
          break;
        }
      }
      const r = i[0] - s[0] || 1;
      let o = (n - s[0]) / r;
      o = o * o * (3 - 2 * o);
      colorMap[e * 3] = s[1] + (i[1] - s[1]) * o;
      colorMap[e * 3 + 1] = s[2] + (i[2] - s[2]) * o;
      colorMap[e * 3 + 2] = s[3] + (i[3] - s[3]) * o;
    }

    let width = 110;
    let height = 80;
    let imgData = ctx.createImageData(width, height);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const aspect = rect.width > 0 && rect.height > 0 ? rect.width / rect.height : 0.75;
      if (aspect >= 1) {
        width = 110;
        height = Math.max(2, Math.round(width / aspect));
      } else {
        height = 110;
        width = Math.max(2, Math.round(height * aspect));
      }
      imgData = ctx.createImageData(width, height);
    };

    resize();
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(canvas);

    const seed = Math.random() * 1000;
    let animFrame: number;

    const render = (time: number) => {
      const data = imgData.data;
      const step = (time / 1000) * 1.35;
      let offset = 0;
      const sin = Math.sin;

      for (let yIndex = 0; yIndex < height; yIndex++) {
        const d = yIndex / (height - 1);
        const h = 0.09 * sin(2.1 * d * Math.PI + seed * 0.19);
        for (let xIndex = 0; xIndex < width; xIndex++) {
          const a = xIndex / (width - 1);
          const u = a + h;
          const m = d + 0.09 * sin(2.4 * a * Math.PI - seed * 0.16 + 1.1);
          let f = 0.7 * Math.sqrt(u * u + 0.5 * m * m) - 0.02 
                  + 0.11 * sin(2.4 * u + 1.7 * m + step * 0.42) 
                  + 0.09 * sin(1.2 * u - 2.1 * m + step * 0.3 + 1.3) 
                  + 0.06 * sin(3.2 * u + 2.7 * m - step * 0.24 + 4.1);
          if (f < 0) f = 0;
          else if (f > 1) f = 1;

          const colorIdx = (f * 255) | 0;
          data[offset] = colorMap[colorIdx * 3];
          data[offset + 1] = colorMap[colorIdx * 3 + 1];
          data[offset + 2] = colorMap[colorIdx * 3 + 2];
          data[offset + 3] = 255;
          offset += 4;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrame);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${opacity}`}
      style={{ filter: `blur(${blur})` }}
    />
  );
}
