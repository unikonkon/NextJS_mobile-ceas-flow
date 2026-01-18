'use client';

import { cn } from '@/lib/utils';
import { formatCurrency, formatPercentage } from '@/lib/utils/format';
import { CategorySummary } from '@/types';
import { useMemo } from 'react';

interface DonutChartProps {
  data: CategorySummary[];
  total: number;
  currency?: string;
  centerLabel?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const chartColors = [
  'oklch(0.72 0.18 45)',    // food - orange
  'oklch(0.70 0.20 330)',   // shopping - pink
  'oklch(0.65 0.18 260)',   // transport - blue
  'oklch(0.72 0.22 300)',   // entertainment - purple
  'oklch(0.70 0.18 175)',   // health - teal
  'oklch(0.62 0.15 230)',   // bills - slate blue
  'oklch(0.74 0.15 85)',    // family - lime
  'oklch(0.72 0.20 350)',   // social - rose
  'oklch(0.60 0.12 200)',   // housing - cyan
  'oklch(0.68 0.18 280)',   // communication - indigo
  'oklch(0.76 0.16 60)',    // clothing - amber
  'oklch(0.60 0.08 260)',   // other - gray
];

export function DonutChart({
  data,
  total,
  currency = 'THB',
  centerLabel = 'ทั้งหมด',
  size = 200,
  strokeWidth = 32,
  className,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = useMemo(() => {
    let currentOffset = 0;

    return data.map((item, index) => {
      const percentage = item.percentage / 100;
      const length = circumference * percentage;
      const offset = currentOffset;
      currentOffset += length;

      return {
        ...item,
        length,
        offset,
        color: chartColors[index % chartColors.length],
      };
    });
  }, [data, circumference]);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 transform"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />

        {/* Data Segments */}
        {segments.map((segment, index) => (
          <circle
            key={segment.category.id}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${segment.length} ${circumference}`}
            strokeDashoffset={-segment.offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          />
        ))}
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-medium text-muted-foreground">{centerLabel}</span>
        <span className="font-numbers text-xl font-bold text-foreground">
          {formatCurrency(total, currency)}
        </span>
      </div>
    </div>
  );
}
