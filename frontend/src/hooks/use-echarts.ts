'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts';

export function useECharts(options: echarts.EChartsOption, theme: string = 'dark') {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);

  const initChart = useCallback(() => {
    if (!chartRef.current) return;

    // Dispose existing instance
    if (instanceRef.current) {
      instanceRef.current.dispose();
    }

    // Create new instance
    instanceRef.current = echarts.init(chartRef.current, theme, {
      renderer: 'canvas',
    });

    // Apply default dark styling
    const darkDefaults: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      textStyle: {
        color: '#A1A1AA',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      legend: {
        textStyle: {
          color: '#A1A1AA',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 15, 20, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.06)',
        textStyle: {
          color: '#FAFAFA',
          fontSize: 12,
        },
        extraCssText: 'backdrop-filter: blur(20px); border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);',
      },
      grid: {
        containLabel: true,
        left: 16,
        right: 16,
        top: 40,
        bottom: 16,
      },
      xAxis: {
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.06)' } },
        axisTick: { lineStyle: { color: 'rgba(255, 255, 255, 0.06)' } },
        axisLabel: { color: '#71717A', fontSize: 11 },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.04)' } },
      },
      yAxis: {
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.06)' } },
        axisTick: { lineStyle: { color: 'rgba(255, 255, 255, 0.06)' } },
        axisLabel: { color: '#71717A', fontSize: 11 },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.04)' } },
      },
    };

    // Deep merge defaults with user options
    const mergedOptions = deepMerge(darkDefaults, options);
    instanceRef.current.setOption(mergedOptions);
  }, [options, theme]);

  // Init on mount
  useEffect(() => {
    initChart();

    return () => {
      if (instanceRef.current) {
        instanceRef.current.dispose();
        instanceRef.current = null;
      }
    };
  }, [initChart]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (instanceRef.current) {
        instanceRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    // Also use ResizeObserver for container resize
    let resizeObserver: ResizeObserver | null = null;
    if (chartRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (instanceRef.current) {
          instanceRef.current.resize();
        }
      });
      resizeObserver.observe(chartRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return { chartRef, instance: instanceRef.current };
}

// Helper: deep merge objects
function deepMerge<T extends Record<string, unknown>>(target: T, source: Record<string, unknown>): T {
  const output = { ...target } as Record<string, unknown>;

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        target[key] &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        output[key] = deepMerge(
          target[key] as Record<string, unknown>,
          source[key] as Record<string, unknown>
        );
      } else {
        output[key] = source[key];
      }
    }
  }

  return output as T;
}

export default useECharts;
