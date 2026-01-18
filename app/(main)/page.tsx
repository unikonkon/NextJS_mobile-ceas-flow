'use client';

import { useState } from 'react';
import { Header, PageContainer } from '@/components/layout';
import { SummaryBar, TransactionList, AddTransactionSheet } from '@/components/transactions';
import { MonthPicker } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Search } from 'lucide-react';
import {
  mockDailySummaries,
  mockMonthlySummary,
  mockExpenseCategories,
  mockIncomeCategories,
} from '@/lib/mock/data';

export default function HomePage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

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
          income={mockMonthlySummary.income}
          expense={mockMonthlySummary.expense}
          className="mb-6"
        />

        {/* Transaction List */}
        <TransactionList
          dailySummaries={mockDailySummaries}
          onTransactionClick={(id) => console.log('Transaction clicked:', id)}
        />
      </PageContainer>

      {/* FAB - Add Transaction */}
      <AddTransactionSheet
        trigger={
          <Button
            size="lg"
            className="fixed bottom-20 right-4 z-40 size-14 rounded-full shadow-lg shadow-primary/25"
          >
            <Plus className="size-6" />
          </Button>
        }
        expenseCategories={mockExpenseCategories}
        incomeCategories={mockIncomeCategories}
        onSubmit={(data) => console.log('New transaction:', data)}
      />
    </>
  );
}
