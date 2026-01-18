'use client';

import { Header, PageContainer } from '@/components/layout';
import { WalletSummary, WalletList } from '@/components/wallets';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { mockWallets, mockWalletSummary } from '@/lib/mock/data';

export default function WalletsPage() {
  return (
    <>
      <Header
        title="กระเป๋าเงิน"
        rightAction={
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" className="rounded-full">
              <Settings className="size-5" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="rounded-full">
              <Plus className="size-5" />
            </Button>
          </div>
        }
      />

      <PageContainer className="pt-4 space-y-6">
        {/* Net Worth Summary */}
        <WalletSummary
          netWorth={mockWalletSummary.netWorth}
          totalAssets={mockWalletSummary.totalAssets}
          totalLiabilities={mockWalletSummary.totalLiabilities}
        />

        {/* Wallet List */}
        <WalletList
          wallets={mockWallets}
          onWalletClick={(wallet) => console.log('Wallet clicked:', wallet.name)}
        />
      </PageContainer>
    </>
  );
}
