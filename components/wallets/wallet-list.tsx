'use client';

import { cn } from '@/lib/utils';
import { Wallet } from '@/types';
import { WalletCard } from './wallet-card';
import { EmptyState } from '@/components/common/empty-state';

interface WalletListProps {
  wallets: Wallet[];
  onWalletClick?: (wallet: Wallet) => void;
  className?: string;
}

export function WalletList({
  wallets,
  onWalletClick,
  className,
}: WalletListProps) {
  if (wallets.length === 0) {
    return (
      <EmptyState
        icon="👛"
        title="ยังไม่มีบัญชี"
        description="เพิ่มบัญชีแรกของคุณเพื่อเริ่มติดตามเงินของคุณ"
      />
    );
  }

  // Separate assets and liabilities
  const assets = wallets.filter((w) => w.isAsset);
  const liabilities = wallets.filter((w) => !w.isAsset);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Assets Section */}
      {assets.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <span className="size-2 rounded-full bg-income" />
            สินทรัพย์
          </h3>
          <div className="space-y-3 stagger-children">
            {assets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                onClick={() => onWalletClick?.(wallet)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Liabilities Section */}
      {liabilities.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <span className="size-2 rounded-full bg-expense" />
            หนี้สิน
          </h3>
          <div className="space-y-3 stagger-children">
            {liabilities.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                onClick={() => onWalletClick?.(wallet)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
