'use client';

import { cn } from '@/lib/utils';
import { Wallet } from '@/types';
import { formatCurrency } from '@/lib/utils/format';
import { Card } from '@/components/ui/card';

interface WalletCardProps {
  wallet: Wallet;
  onClick?: () => void;
  className?: string;
}

const walletTypeIcons: Record<string, string> = {
  cash: '💵',
  bank: '🏦',
  credit_card: '💳',
  e_wallet: '📱',
  savings: '🐷',
};

const walletTypeLabels: Record<string, string> = {
  cash: 'เงินสด',
  bank: 'บัญชีธนาคาร',
  credit_card: 'บัตรเครดิต',
  e_wallet: 'E-Wallet',
  savings: 'บัญชีออมทรัพย์',
};

export function WalletCard({
  wallet,
  onClick,
  className,
}: WalletCardProps) {
  const isNegative = wallet.currentBalance < 0;

  return (
    <Card
      className={cn(
        'group relative overflow-hidden cursor-pointer transition-all duration-300',
        'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        'bg-gradient-to-br from-card to-card/80',
        className
      )}
      onClick={onClick}
    >
      {/* Decorative Background */}
      <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
      <div className="absolute -bottom-4 -left-4 size-24 rounded-full bg-accent/10 blur-xl" />

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-xl">
              {wallet.icon || walletTypeIcons[wallet.type]}
            </div>

            {/* Name & Type */}
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">{wallet.name}</span>
              <span className="text-xs text-muted-foreground">
                {walletTypeLabels[wallet.type]}
              </span>
            </div>
          </div>

          {/* Asset/Liability Badge */}
          {!wallet.isAsset && (
            <span className="rounded-full bg-expense/10 px-2 py-0.5 text-[10px] font-medium text-expense">
              หนี้สิน
            </span>
          )}
        </div>

        {/* Balance */}
        <div className="mt-4 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">ยอดคงเหลือ</span>
            <span
              className={cn(
                'font-numbers text-2xl font-bold tracking-tight',
                isNegative ? 'text-expense' : 'text-foreground'
              )}
            >
              {formatCurrency(wallet.currentBalance, wallet.currency)}
            </span>
          </div>

          {/* Currency Badge */}
          <span className="rounded-lg bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
            {wallet.currency}
          </span>
        </div>
      </div>
    </Card>
  );
}
