'use client';

import { cn } from '@/lib/utils';
import { DailySummary } from '@/types';
import { formatCurrency, formatRelativeDate, getDayOfWeek } from '@/lib/utils/format';
import { TransactionCard } from './transaction-card';

interface DayGroupProps {
  summary: DailySummary;
  onTransactionClick?: (id: string) => void;
  className?: string;
}

export function DayGroup({
  summary,
  onTransactionClick,
  className,
}: DayGroupProps) {
  const dailyBalance = summary.income - summary.expense;
  const hasIncome = summary.income > 0;
  const hasExpense = summary.expense > 0;

  return (
    <div className={cn('animate-slide-up', className)}>
      {/* Day Header */}
      <div className="sticky top-14 z-10 -mx-4 mb-2 glass px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Date Info */}
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-foreground">
              {formatRelativeDate(summary.date)}
            </span>
            <span className="text-xs text-muted-foreground">
              {getDayOfWeek(summary.date)}
            </span>
          </div>

          {/* Day Summary */}
          <div className="flex items-center gap-3 text-xs font-medium font-numbers">
            {hasIncome && (
              <span className="text-income">
                +{formatCurrency(summary.income)}
              </span>
            )}
            {hasExpense && (
              <span className="text-expense">
                -{formatCurrency(summary.expense)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-1">
        {summary.transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onClick={() => onTransactionClick?.(transaction.id)}
          />
        ))}
      </div>
    </div>
  );
}
