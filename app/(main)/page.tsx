'use client';

import { useState, useMemo, useCallback } from 'react';
import { Header, PageContainer } from '@/components/layout';
import { SummaryBar, TransactionList, AddTransactionSheet } from '@/components/transactions';
import { MonthPicker } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Search, Sparkles } from 'lucide-react';
import {
  mockDailySummaries,
  mockExpenseCategories,
  mockIncomeCategories,
} from '@/lib/mock/data';
import { TransactionWithCategory, DailySummary, TransactionType } from '@/types';

export default function HomePage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>(() => {
    // Initialize with mock transactions from all daily summaries
    return mockDailySummaries.flatMap((summary) => summary.transactions);
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [lastAddedType, setLastAddedType] = useState<TransactionType>('expense');
  const [newTransactionIds, setNewTransactionIds] = useState<string[]>([]);

  // Calculate daily summaries from transactions
  const dailySummaries = useMemo<DailySummary[]>(() => {
    const groupedByDate = transactions.reduce((acc, transaction) => {
      const dateKey = transaction.date.toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: transaction.date,
          income: 0,
          expense: 0,
          transactions: [],
        };
      }
      acc[dateKey].transactions.push(transaction);
      if (transaction.type === 'income') {
        acc[dateKey].income += transaction.amount;
      } else if (transaction.type === 'expense') {
        acc[dateKey].expense += transaction.amount;
      }
      return acc;
    }, {} as Record<string, DailySummary>);

    // Sort by date (newest first)
    return Object.values(groupedByDate).sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }, [transactions]);

  // Calculate monthly summary
  const monthlySummary = useMemo(() => {
    const thisMonth = selectedMonth.getMonth();
    const thisYear = selectedMonth.getFullYear();

    const monthTransactions = transactions.filter((t) => {
      const tMonth = t.date.getMonth();
      const tYear = t.date.getFullYear();
      return tMonth === thisMonth && tYear === thisYear;
    });

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, balance: income - expense };
  }, [transactions, selectedMonth]);

  // Handle adding new transaction
  const handleAddTransaction = useCallback((data: {
    type: TransactionType;
    amount: number;
    categoryId: string;
    note?: string;
  }) => {
    const allCategories = [...mockExpenseCategories, ...mockIncomeCategories];
    const category = allCategories.find((c) => c.id === data.categoryId);

    if (!category) return;

    const now = new Date();
    const newTransaction: TransactionWithCategory = {
      id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      bookId: 'b1',
      walletId: 'w1',
      categoryId: data.categoryId,
      type: data.type,
      amount: data.amount,
      currency: 'THB',
      date: now,
      note: data.note,
      category: category,
      createdAt: now,
      updatedAt: now,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setLastAddedType(data.type);
    setShowSuccessToast(true);
    setNewTransactionIds((prev) => [...prev, newTransaction.id]);

    // Hide toast after 2.5 seconds
    setTimeout(() => setShowSuccessToast(false), 2500);

    // Remove "new" status after animation completes
    setTimeout(() => {
      setNewTransactionIds((prev) => prev.filter((id) => id !== newTransaction.id));
    }, 3000);
  }, []);

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
          onTransactionClick={(id) => console.log('Transaction clicked:', id)}
          newTransactionIds={newTransactionIds}
        />
      </PageContainer>

      {/* FAB - Add Transaction */}
      <AddTransactionSheet
        trigger={
          <Button
            size="lg"
            className="fixed bottom-20 right-4 z-40 size-14 rounded-full shadow-lg shadow-primary/25
              hover:scale-110 active:scale-95 transition-transform duration-200"
          >
            <Plus className="size-6" />
          </Button>
        }
        expenseCategories={mockExpenseCategories}
        incomeCategories={mockIncomeCategories}
        onSubmit={handleAddTransaction}
      />

      {/* Success Toast */}
      <div
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out
          ${showSuccessToast
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
          }`}
      >
        <div
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md
            ${lastAddedType === 'income'
              ? 'bg-income/90 text-white'
              : lastAddedType === 'expense'
                ? 'bg-expense/90 text-white'
                : 'bg-transfer/90 text-white'
            }`}
        >
          <Sparkles className="size-5 animate-pulse" />
          <span className="font-medium">
            {lastAddedType === 'income' ? 'เพิ่มรายรับสำเร็จ!' :
             lastAddedType === 'expense' ? 'เพิ่มรายจ่ายสำเร็จ!' :
             'โอนเงินสำเร็จ!'}
          </span>
        </div>
      </div>
    </>
  );
}
