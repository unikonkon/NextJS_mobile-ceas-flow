'use client';

import { cn } from '@/lib/utils';
import { CategorySummary } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils/format';
import { CategoryIcon } from '@/components/categories/category-icon';
import { Progress } from '@/components/ui/progress';

interface CategoryBreakdownProps {
  data: CategorySummary[];
  currency?: string;
  showProgress?: boolean;
  className?: string;
}

export function CategoryBreakdown({
  data,
  currency = 'THB',
  showProgress = true,
  className,
}: CategoryBreakdownProps) {
  // Sort by amount descending
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  return (
    <div className={cn('space-y-3 stagger-children', className)}>
      {sortedData.map((item, index) => (
        <div
          key={item.category.id}
          className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent/30"
        >
          {/* Rank */}
          <span className="w-5 text-center text-xs font-medium text-muted-foreground">
            {index + 1}
          </span>

          {/* Category Icon */}
          <CategoryIcon
            icon={item.category.icon}
            color={item.category.color}
            size="sm"
          />

          {/* Content */}
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {item.category.name}
              </span>
              <span className="font-numbers text-sm font-semibold text-foreground">
                {formatCurrency(item.amount, currency)}
              </span>
            </div>

            {showProgress && (
              <div className="flex items-center gap-2">
                <Progress
                  value={item.percentage}
                  className="h-1.5 flex-1"
                />
                <span className="font-numbers text-xs text-muted-foreground">
                  {formatPercentage(item.percentage)}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
