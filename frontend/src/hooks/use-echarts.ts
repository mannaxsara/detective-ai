'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts';
import { useTheme } from 'next-themes';

export function useECharts(options: echarts.EChartsOption) {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const initChart = useCallback(() => {
    if (!chartRef.current) return;

    // Dispose existing instance to re-theme cleanly
    if (instanceRef.current) {
      instanceRef.current.dispose();
    }

    // Create new instance
    instanceRef.current = echarts.init(chartRef.current, undefined, {
      renderer: 'canvas',
    });

    const textColor = isDark ? '#fcfcfc' : '#043f2e';
    const axisLabelColor = isDark ? '#d2ddd2' : '#242423';
    const splitLineColor = isDark ? 'rgba(200, 241, 105, 0.1)' : 'rgba(0, 0, 0, 0.08)';
    const axisLineColor = isDark ? 'rgba(200, 241, 105, 0.2)' : 'rgba(0, 0, 0, 0.2)';
    const tooltipBg = isDark ? '#0a4f3b' : '#fcfcfc';
    const tooltipBorder = isDark ? '#c8f169' : '#000000';
    const tooltipText = isDark ? '#fcfcfc' : '#043f2e';

    const defaultOptions: echarts.EChartsOption = {
      color: ['#043f2e', '#2a6f2b', '#78c51c', '#c8f169', '#bed4fb', '#31e992'],
      backgroundColor: 'transparent',
      textStyle: {
        color: textColor,
        fontFamily: 'Inter, var(--font-sans), system-ui, sans-serif',
      },
      legend: {
        show: false,
        textStyle: {
          color: textColor,
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textStyle: {
          color: tooltipText,
          fontSize: 12,
        },
        extraCssText: 'backdrop-filter: blur(12px); border-radius: 8px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);',
      },
      grid: {
        containLabel: true,
        left: 16,
        right: 16,
        top: 40,
        bottom: 16,
      },
      xAxis: {
        axisLine: { lineStyle: { color: axisLineColor } },
        axisTick: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: axisLabelColor, fontSize: 11 },
        splitLine: { lineStyle: { color: splitLineColor } },
      },
      yAxis: {
        axisLine: { lineStyle: { color: axisLineColor } },
        axisTick: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: axisLabelColor, fontSize: 11 },
        splitLine: { lineStyle: { color: splitLineColor } },
      },
    };

    try {
      const mergedOptions = deepMerge(defaultOptions, options);
      instanceRef.current.setOption(mergedOptions);
    } catch (e) {
      console.error('ECharts: Failed to apply chart options', e);
    }
  }, [options, isDark]);

  useEffect(() => {
    initChart();

    return () => {
      if (instanceRef.current) {
        instanceRef.current.dispose();
        instanceRef.current = null;
      }
    };
  }, [initChart]);

  useEffect(() => {
    const handleResize = () => {
      if (instanceRef.current) {
        instanceRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

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
