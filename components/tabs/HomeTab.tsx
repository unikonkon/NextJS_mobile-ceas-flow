'use client';

import { useState } from 'react';
import { Header, PageContainer } from '@/components/layout';
import { SummaryBar, TransactionList, EditTransactionSheet } from '@/components/transactions';
import { MonthPicker } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Calendar, Search, Sparkles } from 'lucide-react';
import { useTransactionStore, useCategoryStore } from '@/lib/stores';
import { TransactionWithCategory } from '@/types';

export function HomeTab() {
  // Edit sheet state
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  // Store selectors
  const selectedMonth = useTransactionStore((s) => s.selectedMonth);
  const setSelectedMonth = useTransactionStore((s) => s.setSelectedMonth);
  const newTransactionIds = useTransactionStore((s) => s.newTransactionIds);
  const dailySummaries = useTransactionStore((s) => s.dailySummaries);
  const monthlySummary = useTransactionStore((s) => s.monthlySummary);
  const toastVisible = useTransactionStore((s) => s.toastVisible);
  const toastType = useTransactionStore((s) => s.toastType);
  const getTransactionById = useTransactionStore((s) => s.getTransactionById);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);

  // Category store
  const expenseCategories = useCategoryStore((s) => s.expenseCategories);
  const incomeCategories = useCategoryStore((s) => s.incomeCategories);

  const handleTransactionClick = (id: string) => {
    const transaction = getTransactionById(id);
    if (transaction) {
      setEditingTransaction(transaction);
      setEditSheetOpen(true);
    }
  };

  const handleEditSheetChange = (open: boolean) => {
    setEditSheetOpen(open);
    if (!open) {
      setEditingTransaction(null);
    }
  };

  // console.log("newTransactionIds", newTransactionIds);
  // console.log("dailySummaries", dailySummaries);

  return (
    <>
      <Header
        showBookSelector
        currentBook="บัญชีส่วนตัว"
        rightAction={
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" className="rounded-full">
              <Search className="size-5" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="rounded-full">
              <Calendar className="size-5" />
            </Button>
          </div>
        }
      />

      <PageContainer className="pt-4">
        {/* Month Picker */}
        <div className="mb-4">
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
        </div>

        {/* Summary */}
        <SummaryBar
          income={monthlySummary.income}
          expense={monthlySummary.expense}
          className="mb-6"
        />

        {/* Transaction List */}
        <TransactionList
          dailySummaries={dailySummaries}
          onTransactionClick={handleTransactionClick}
          newTransactionIds={newTransactionIds}
        />
      </PageContainer>

      {/* Edit Transaction Sheet */}
      <EditTransactionSheet
        transaction={editingTransaction}
        open={editSheetOpen}
        onOpenChange={handleEditSheetChange}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        onUpdate={updateTransaction}
        onDelete={deleteTransaction}
      />

      {/* Success Toast */}
      <div
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out
          ${toastVisible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
          }`}
      >
        <div
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md
            ${toastType === 'income'
              ? 'bg-income/90 text-white'
              : 'bg-expense/90 text-white'
            }`}
        >
          <Sparkles className="size-5 animate-pulse" />
          <span className="font-medium">บันทึกสำเร็จ!</span>
        </div>
      </div>
    </>
  );
}
