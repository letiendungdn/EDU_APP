'use client';

import { useReportWebVitals } from 'next/web-vitals';

type MetricName = 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';

const THRESHOLDS: Record<string, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
};

function rating(name: MetricName, value: number): string {
  const t = THRESHOLDS[name];
  if (!t) return 'unknown';
  if (value <= t.good) return 'good';
  if (value >= t.poor) return 'poor';
  return 'needs-improvement';
}

export default function WebVitals() {
  useReportWebVitals((metric) => {
    const label = rating(metric.name as MetricName, metric.value);
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${label})`);
    }
  });

  return null;
}
