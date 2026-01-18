'use client';

import { cn } from '@/lib/utils';
import { TransactionWithCategory } from '@/types';
import { formatCurrency } from '@/lib/utils/format';
import { CategoryIcon } from '@/components/categories/category-icon';

interface TransactionCardProps {
  transaction: TransactionWithCategory;
  onClick?: () => void;
  className?: string;
  isNew?: boolean;
}

export function TransactionCard({
  transaction,
  onClick,
  className,
  isNew = false,
}: TransactionCardProps) {
  const isExpense = transaction.type === 'expense';
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';

  const amountDisplay = isExpense
    ? `-${formatCurrency(transaction.amount, transaction.currency)}`
    : isIncome
    ? `+${formatCurrency(transaction.amount, transaction.currency)}`
    : formatCurrency(transaction.amount, transaction.currency);

  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all duration-200',
        'hover:bg-accent/50 active:scale-[0.98]',
        isNew && 'animate-pop-in-glow transaction-new bg-accent/30',
        className
      )}
    >
      {/* Category Icon */}
      <CategoryIcon
        icon={transaction.category.icon}
        color={transaction.category.color}
        size="md"
      />

      {/* Content */}
      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
        <span className="truncate font-medium text-foreground">
          {transaction.category.name}
        </span>

        {transaction.note && (
          <span className="truncate text-xs text-muted-foreground">
            {transaction.note}
          </span>
        )}

        {isTransfer && transaction.toWallet && transaction.wallet && (
          <span className="text-xs text-muted-foreground">
            {transaction.wallet.name} → {transaction.toWallet.name}
          </span>
        )}
      </div>

      {/* Amount */}
      <div className="flex flex-col items-end gap-0.5">
        <span
          className={cn(
            'font-numbers text-base font-semibold tabular-nums',
            isExpense && 'text-expense',
            isIncome && 'text-income',
            isTransfer && 'text-transfer'
          )}
        >
          {amountDisplay}
        </span>

        {transaction.wallet && !isTransfer && (
          <span className="text-[10px] text-muted-foreground">
            {transaction.wallet.name}
          </span>
        )}
      </div>
    </button>
  );
}
