'use client';

import { useState } from 'react';
import { Header, PageContainer } from '@/components/layout';
import { DonutChart, CategoryBreakdown, AnalyticsTabs, AnalyticsTabContent } from '@/components/analytics';
import { MonthPicker } from '@/components/common';
import { Card } from '@/components/ui/card';
import { mockExpenseSummaries, mockIncomeSummaries, mockMonthlySummary } from '@/lib/mock/data';
import { formatCurrency } from '@/lib/utils/format';

export default function AnalyticsPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  return (
    <>
      <Header title="การวิเคราะห์" />

      <PageContainer className="pt-4 space-y-6">
        {/* Month Picker */}
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />

        {/* Analytics Tabs */}
        <AnalyticsTabs>
          {/* Expense Tab */}
          <AnalyticsTabContent value="expense">
            <div className="space-y-6">
              {/* Donut Chart */}
              <Card className="flex flex-col items-center gap-6 p-6">
                <DonutChart
                  data={mockExpenseSummaries}
                  total={mockMonthlySummary.expense}
                  centerLabel="ค่าใช้จ่าย"
                />
              </Card>

              {/* Category Breakdown */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                  รายละเอียดตามหมวดหมู่
                </h3>
                <Card className="p-2">
                  <CategoryBreakdown data={mockExpenseSummaries} />
                </Card>
              </div>
            </div>
          </AnalyticsTabContent>

          {/* Income Tab */}
          <AnalyticsTabContent value="income">
            <div className="space-y-6">
              <Card className="flex flex-col items-center gap-6 p-6">
                <DonutChart
                  data={mockIncomeSummaries}
                  total={mockMonthlySummary.income}
                  centerLabel="รายได้"
                />
              </Card>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                  รายละเอียดตามหมวดหมู่
                </h3>
                <Card className="p-2">
                  <CategoryBreakdown data={mockIncomeSummaries} />
                </Card>
              </div>
            </div>
          </AnalyticsTabContent>

          {/* Balance Tab */}
          <AnalyticsTabContent value="balance">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">ยอดคงเหลือเดือนนี้</p>
                  <p className={`font-numbers text-3xl font-bold ${mockMonthlySummary.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                    {mockMonthlySummary.balance >= 0 ? '+' : ''}{formatCurrency(mockMonthlySummary.balance)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-income-muted p-4 text-center">
                    <p className="text-xs text-muted-foreground">รายรับ</p>
                    <p className="font-numbers text-lg font-bold text-income">
                      +{formatCurrency(mockMonthlySummary.income)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-expense-muted p-4 text-center">
                    <p className="text-xs text-muted-foreground">รายจ่าย</p>
                    <p className="font-numbers text-lg font-bold text-expense">
                      -{formatCurrency(mockMonthlySummary.expense)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </AnalyticsTabContent>

          {/* Assets Tab */}
          <AnalyticsTabContent value="assets">
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                รายละเอียดสินทรัพย์จะแสดงที่นี่
              </p>
            </Card>
          </AnalyticsTabContent>

          {/* Liabilities Tab */}
          <AnalyticsTabContent value="liabilities">
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                รายละเอียดหนี้สินจะแสดงที่นี่
              </p>
            </Card>
          </AnalyticsTabContent>
        </AnalyticsTabs>
      </PageContainer>
    </>
  );
}
