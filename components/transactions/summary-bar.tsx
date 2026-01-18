'use client';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/format';

interface SummaryBarProps {
  income: number;
  expense: number;
  currency?: string;
  showBalance?: boolean;
  className?: string;
}

export function SummaryBar({
  income,
  expense,
  currency = 'THB',
  showBalance = true,
  className,
}: SummaryBarProps) {
  const balance = income - expense;

  return (
    <div
      className={cn(
        'grid grid-cols-3 gap-2 rounded-2xl bg-card p-4 shadow-soft',
        className
      )}
    >
      {/* Income */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-medium text-muted-foreground">รายรับ</span>
        <span className="font-numbers text-base font-bold text-income">
          +{formatCurrency(income, currency)}
        </span>
      </div>

      {/* Expense */}
      <div className="flex flex-col items-center gap-1 border-x border-border/50">
        <span className="text-xs font-medium text-muted-foreground">รายจ่าย</span>
        <span className="font-numbers text-base font-bold text-expense">
          -{formatCurrency(expense, currency)}
        </span>
      </div>

      {/* Balance */}
      {showBalance && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-medium text-muted-foreground">คงเหลือ</span>
          <span
            className={cn(
              'font-numbers text-base font-bold',
              balance >= 0 ? 'text-income' : 'text-expense'
            )}
          >
            {balance >= 0 ? '+' : ''}
            {formatCurrency(balance, currency)}
          </span>
        </div>
      )}
    </div>
  );
}
