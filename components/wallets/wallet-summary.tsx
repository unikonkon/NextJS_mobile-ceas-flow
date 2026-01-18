'use client';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/format';
import { Card } from '@/components/ui/card';

interface WalletSummaryProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  currency?: string;
  className?: string;
}

export function WalletSummary({
  netWorth,
  totalAssets,
  totalLiabilities,
  currency = 'THB',
  className,
}: WalletSummaryProps) {
  const isPositive = netWorth >= 0;

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Net Worth - Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
        {/* Decorative Elements */}
        <div className="absolute right-0 top-0 size-40 rounded-bl-full bg-gradient-to-bl from-primary/10 to-transparent" />
        <div className="absolute bottom-0 left-0 size-24 rounded-tr-full bg-gradient-to-tr from-accent/10 to-transparent" />

        <div className="relative flex flex-col items-center gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            สินทรัพย์สุทธิ
          </span>
          <span
            className={cn(
              'font-numbers text-3xl font-bold tracking-tight',
              isPositive ? 'text-foreground' : 'text-expense'
            )}
          >
            {formatCurrency(netWorth, currency)}
          </span>
        </div>
      </div>

      {/* Assets & Liabilities */}
      <div className="grid grid-cols-2 divide-x divide-border">
        {/* Assets */}
        <div className="flex flex-col items-center gap-1 p-4">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-income" />
            <span className="text-xs font-medium text-muted-foreground">สินทรัพย์</span>
          </div>
          <span className="font-numbers text-lg font-semibold text-income">
            {formatCurrency(totalAssets, currency)}
          </span>
        </div>

        {/* Liabilities */}
        <div className="flex flex-col items-center gap-1 p-4">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-expense" />
            <span className="text-xs font-medium text-muted-foreground">หนี้สิน</span>
          </div>
          <span className="font-numbers text-lg font-semibold text-expense">
            {formatCurrency(totalLiabilities, currency)}
          </span>
        </div>
      </div>
    </Card>
  );
}
