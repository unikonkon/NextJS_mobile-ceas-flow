'use client';

import { cn } from '@/lib/utils';
import { Wallet } from '@/types';
import { WalletBalance } from '@/lib/stores/transaction-store';
import { formatCurrency } from '@/lib/utils/format';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Wallet as WalletIcon,
  CreditCard,
  Banknote,
  PiggyBank,
  Check,
} from 'lucide-react';

interface WalletPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallets: Wallet[];
  selectedWalletId: string | null;
  walletBalances: Record<string, WalletBalance>;
  onSelect: (walletId: string) => void;
}

// Map wallet icons
const walletIconMap: Record<string, React.ReactNode> = {
  wallet: <WalletIcon className="size-5" />,
  'credit-card': <CreditCard className="size-5" />,
  banknote: <Banknote className="size-5" />,
  'piggy-bank': <PiggyBank className="size-5" />,
};

export function WalletPickerModal({
  open,
  onOpenChange,
  wallets,
  selectedWalletId,
  walletBalances,
  onSelect,
}: WalletPickerModalProps) {
  const handleSelect = (walletId: string) => {
    onSelect(walletId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden border-border/50">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="text-base font-semibold text-center">
            เลือกกระเป๋าเงิน
          </DialogTitle>
        </DialogHeader>

        <div className="px-3 pb-4 pt-3 space-y-1.5 max-h-[60vh] overflow-y-auto">
          {wallets.map((wallet) => {
            const isSelected = wallet.id === selectedWalletId;
            const balance = walletBalances[wallet.id]?.balance ?? 0;

            return (
              <button
                key={wallet.id}
                onClick={() => handleSelect(wallet.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
                  'hover:bg-muted/60 active:scale-[0.98]',
                  isSelected && 'bg-primary/10 ring-2 ring-primary/30'
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'flex items-center justify-center size-10 rounded-xl',
                    'bg-linear-to-br shadow-sm',
                    isSelected
                      ? 'from-primary/20 to-primary/10 text-primary'
                      : 'from-muted to-muted/50 text-muted-foreground'
                  )}
                  style={
                    wallet.color
                      ? {
                        background: `linear-gradient(135deg, ${wallet.color}20, ${wallet.color}10)`,
                        color: wallet.color,
                      }
                      : undefined
                  }
                >
                  {walletIconMap[wallet.icon] || <WalletIcon className="size-5" />}
                </div>

                {/* Wallet Info */}
                <div className="flex-1 text-left">
                  <p
                    className={cn(
                      'font-medium text-sm',
                      isSelected ? 'text-foreground' : 'text-foreground/80'
                    )}
                  >
                    {wallet.name}
                  </p>
                  <p
                    className={cn(
                      'text-xs font-numbers',
                      balance >= 0 ? 'text-income' : 'text-expense'
                    )}
                  >
                    {formatCurrency(balance)}
                  </p>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3.5" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
