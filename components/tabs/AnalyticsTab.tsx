'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Header, PageContainer } from '@/components/layout';
import { CurrencyDisplay } from '@/components/common';
import { useTransactionStore, useCategoryStore } from '@/lib/stores';
import { CategorySummary, TransactionWithCategory, Category } from '@/types';
import {
  ChevronLeft,
  ChevronRight,
  PieChart,
  Check,
  ChevronDown,
  CalendarDays,
  Calendar,
  RotateCcw,
  Receipt,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// ============================================
// Types
// ============================================
type FilterMode = 'monthly' | 'yearly';

interface MonthSelection {
  month: number;
  year: number;
  key: string;
}

// ============================================
// Utility Functions
// ============================================
function getMonthKey(month: number, year: number): string {
  return `${year}-${month.toString().padStart(2, '0')}`;
}

function getFullMonthName(month: number): string {
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  return months[month];
}

function getShortMonthName(month: number): string {
  const months = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  return months[month];
}

function filterByMonths(
  transactions: TransactionWithCategory[],
  selections: MonthSelection[]
): TransactionWithCategory[] {
  return transactions.filter((t) =>
    selections.some(
      (s) => t.date.getMonth() === s.month && t.date.getFullYear() === s.year
    )
  );
}

function filterByYear(
  transactions: TransactionWithCategory[],
  year: number
): TransactionWithCategory[] {
  return transactions.filter((t) => t.date.getFullYear() === year);
}

function computeCategorySummaries(
  transactions: TransactionWithCategory[],
  type: 'expense' | 'income'
): CategorySummary[] {
  const filtered = transactions.filter((t) => t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  const categoryMap = new Map<string, CategorySummary>();

  filtered.forEach((t) => {
    const existing = categoryMap.get(t.categoryId);
    if (existing) {
      existing.amount += t.amount;
      existing.transactionCount += 1;
    } else {
      categoryMap.set(t.categoryId, {
        category: t.category,
        amount: t.amount,
        percentage: 0,
        transactionCount: 1,
      });
    }
  });

  const summaries = Array.from(categoryMap.values())
    .map((s) => ({
      ...s,
      percentage: total > 0 ? (s.amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return summaries;
}

function getAvailableYears(transactions: TransactionWithCategory[]): number[] {
  const years = new Set(transactions.map((t) => t.date.getFullYear()));
  return Array.from(years).sort((a, b) => b - a);
}

// ============================================
// Chart Colors
// ============================================
const CHART_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#84cc16', '#6366f1',
];

// ============================================
// Sub Components
// ============================================

function FilterModeToggle({
  mode,
  onModeChange,
}: {
  mode: FilterMode;
  onModeChange: (mode: FilterMode) => void;
}) {
  return (
    <div className="flex bg-muted/50 rounded-xl p-1 gap-1">
      <button
        onClick={() => onModeChange('monthly')}
        className={cn(
          'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
          mode === 'monthly'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <CalendarDays className="size-4" />
        <span>รายเดือน</span>
      </button>
      <button
        onClick={() => onModeChange('yearly')}
        className={cn(
          'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
          mode === 'yearly'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Calendar className="size-4" />
        <span>รายปี</span>
      </button>
    </div>
  );
}

function YearSelector({
  years,
  selectedYear,
  onSelect,
  showFullYear,
}: {
  years: number[];
  selectedYear: number;
  onSelect: (year: number) => void;
  showFullYear?: boolean;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {years.map((year) => (
        <button
          key={year}
          onClick={() => onSelect(year)}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300',
            'border border-transparent shrink-0',
            selectedYear === year
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          {showFullYear ? `พ.ศ. ${year + 543}` : year + 543}
        </button>
      ))}
    </div>
  );
}

function MonthMultiSelector({
  selectedYear,
  selectedMonths,
  onToggleMonth,
  currentMonth,
  currentYear,
  onNavigate,
}: {
  selectedYear: number;
  selectedMonths: MonthSelection[];
  onToggleMonth: (month: number) => void;
  currentMonth: number;
  currentYear: number;
  onNavigate: (direction: 'prev' | 'next') => void;
}) {
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="space-y-3">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('prev')}
          className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors active:scale-95"
        >
          <ChevronLeft className="size-5 text-muted-foreground" />
        </button>

        <div className="text-center">
          <p className="text-base font-semibold text-foreground">
            {selectedMonths.length === 1
              ? getFullMonthName(selectedMonths[0].month)
              : selectedMonths.length === 12
              ? 'ทั้งปี'
              : `${selectedMonths.length} เดือน`}
          </p>
          <p className="text-xs text-muted-foreground">
            พ.ศ. {selectedYear + 543}
          </p>
        </div>

        <button
          onClick={() => onNavigate('next')}
          className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors active:scale-95"
        >
          <ChevronRight className="size-5 text-muted-foreground" />
        </button>
      </div>

      {/* Month Grid */}
      <div className="grid grid-cols-4 gap-2">
        {months.map((month) => {
          const isSelected = selectedMonths.some((s) => s.month === month);
          const isCurrent = month === currentMonth && selectedYear === currentYear;

          return (
            <button
              key={month}
              onClick={() => onToggleMonth(month)}
              className={cn(
                'relative py-2.5 px-2 rounded-xl text-sm font-medium transition-all duration-200',
                'border-2',
                isSelected
                  ? 'bg-primary/10 border-primary text-primary'
                  : isCurrent
                  ? 'bg-muted border-muted-foreground/30 text-foreground'
                  : 'bg-card border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              {getShortMonthName(month)}
              {isSelected && (
                <div className="absolute -top-1 -right-1 size-4 bg-primary rounded-full flex items-center justify-center">
                  <Check className="size-2.5 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Hint */}
      <p className="text-xs text-center text-muted-foreground">
        กดเลือกหลายเดือนได้ • กดซ้ำเพื่อยกเลิก
      </p>
    </div>
  );
}

function DonutChart({
  summaries,
  totalAmount,
  centerLabel,
  chartKey,
}: {
  summaries: CategorySummary[];
  totalAmount: number;
  centerLabel: string;
  chartKey: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [chartKey]);

  const data = useMemo(() => {
    if (summaries.length === 0) {
      return {
        labels: ['ไม่มีข้อมูล'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e5e7eb'],
          borderWidth: 0,
          cutout: '65%',
        }],
      };
    }

    return {
      labels: summaries.map((s) => `${s.category.icon} ${s.category.name}`),
      datasets: [{
        data: summaries.map((s) => s.amount),
        backgroundColor: summaries.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        borderWidth: 0,
        cutout: '65%',
        borderRadius: 6,
        spacing: 3,
      }],
    };
  }, [summaries]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        titleColor: '#fff',
        bodyColor: '#e5e7eb',
        padding: 14,
        cornerRadius: 14,
        displayColors: true,
        boxPadding: 6,
        titleFont: { size: 13, weight: 600 },
        bodyFont: { size: 12 },
        callbacks: {
          label: (context: { parsed: number }) => {
            const value = context.parsed;
            const percentage = totalAmount > 0 ? ((value / totalAmount) * 100).toFixed(1) : '0';
            return ` ${value.toLocaleString()} บาท (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 700,
      easing: 'easeOutQuart' as const,
    },
  }), [totalAmount]);

  // Threshold for small categories
  const SMALL_CATEGORY_THRESHOLD = 3; // Categories < 3% are considered small

  // Calculate label positions around the donut
  const labelPositions = useMemo(() => {
    if (summaries.length === 0) return [];

    const total = summaries.reduce((sum, s) => sum + s.amount, 0);
    let currentAngle = -Math.PI / 2; // Start from top
    const radius = 140; // Distance from center for labels

    return summaries.map((summary, index) => {
      const percentage = total > 0 ? (summary.amount / total) * 100 : 0;
      const angleSize = (summary.amount / total) * 2 * Math.PI;
      const midAngle = currentAngle + angleSize / 2;
      currentAngle += angleSize;

      // Calculate position
      const x = Math.cos(midAngle) * radius;
      const y = Math.sin(midAngle) * radius;

      // Determine if label should be on left or right side
      const isRightSide = midAngle > -Math.PI / 2 && midAngle < Math.PI / 2;

      return {
        summary,
        index,
        x,
        y,
        percentage,
        isRightSide,
        isSmall: percentage < SMALL_CATEGORY_THRESHOLD,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });
  }, [summaries]);

  // Large categories (>= 3%) - shown as floating labels around chart
  const largeCategories = useMemo(() => {
    return labelPositions.filter(l => !l.isSmall); // Show ALL categories >= 2%
  }, [labelPositions]);

  // Small categories (< 3%) - shown in bottom legend
  const smallCategories = useMemo(() => {
    return labelPositions.filter(l => l.isSmall && l.percentage > 0);
  }, [labelPositions]);

  return (
    <div className="relative">
      {/* Chart Container with Labels */}
      <div className="relative w-full max-w-[320px] mx-auto aspect-square">
        {/* The Chart */}
        <div className="absolute inset-[35px]">
          <Doughnut key={chartKey} data={data} options={options} />
        </div>

        {/* Floating Labels for LARGE categories (>= 3%) around the chart */}
        {isVisible && largeCategories.length > 0 && largeCategories.map((item, idx) => {
          const centerOffset = 160; // center of the container
          const labelX = centerOffset + item.x * 0.95;
          const labelY = centerOffset + item.y * 0.95;

          return (
            <div
              key={item.summary.category.id}
              className={cn(
                'absolute transition-all duration-600',
                'pointer-events-none',
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
              )}
              style={{
                left: labelX,
                top: labelY,
                transform: `translate(-50%, -50%)`,
                transitionDelay: `${idx * 80 + 200}ms`,
              }}
            >
              {/* Large category label with icon + name + % */}
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-1.5 rounded-xl shadow-lg backdrop-blur-md',
                  'border bg-background/80'
                )}
                style={{
                  borderColor: `${item.color}50`,
                  boxShadow: `0 4px 12px ${item.color}20`,
                }}
              >
                {/* Icon */}
                <div
                  className="size-6 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{ backgroundColor: `${item.color}25` }}
                >
                  {item.summary.category.icon}
                </div>
                {/* Name + % */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-medium text-foreground truncate max-w-[50px]">
                    {item.summary.category.name}
                  </span>
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: item.color }}
                  >
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">
            {centerLabel}
          </span>
          <CurrencyDisplay
            amount={totalAmount}
            size="lg"
            variant="expense"
            className="text-xl! font-bold"
          />
          <span className="text-[10px] text-muted-foreground mt-0.5">
            {summaries.length} หมวด
          </span>
        </div>
      </div>

      {/* Legend - Small categories (< 3%) with icon + name */}
      {smallCategories.length > 0 && (
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px flex-1 bg-border/40" />
            <span className="text-[10px] text-muted-foreground px-2 font-medium">
              หมวดอื่นๆ ({smallCategories.length})
            </span>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          {/* Small categories grid */}
          <div className="flex flex-wrap justify-center gap-1.5">
            {smallCategories.map((item, idx) => (
              <div
                key={item.summary.category.id}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-lg shrink-0',
                  'bg-muted/30 border border-border/20',
                  'transition-all duration-300 hover:bg-muted/50',
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                )}
                style={{ transitionDelay: `${idx * 30 + 500}ms` }}
              >
                <span className="text-xs">{item.summary.category.icon}</span>
                <span className="text-[10px] text-muted-foreground max-w-[45px] truncate">
                  {item.summary.category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Category Detail Sheet
// ============================================
interface GroupedTransactions {
  date: Date;
  dateKey: string;
  transactions: TransactionWithCategory[];
  totalAmount: number;
}

function formatDateThai(date: Date): string {
  const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
}

function groupTransactionsByDate(transactions: TransactionWithCategory[]): GroupedTransactions[] {
  const grouped = new Map<string, GroupedTransactions>();

  transactions.forEach((t) => {
    const dateKey = t.date.toISOString().split('T')[0];
    const existing = grouped.get(dateKey);

    if (existing) {
      existing.transactions.push(t);
      existing.totalAmount += t.amount;
    } else {
      grouped.set(dateKey, {
        date: t.date,
        dateKey,
        transactions: [t],
        totalAmount: t.amount,
      });
    }
  });

  return Array.from(grouped.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getTotalDaysInMonths(transactions: TransactionWithCategory[]): number {
  if (transactions.length === 0) return 0;

  // Get unique months from transactions
  const monthSet = new Set<string>();
  transactions.forEach((t) => {
    const year = t.date.getFullYear();
    const month = t.date.getMonth();
    monthSet.add(`${year}-${month}`);
  });

  // Calculate total days in all months
  let totalDays = 0;
  monthSet.forEach((monthKey) => {
    const [year, month] = monthKey.split('-').map(Number);
    totalDays += getDaysInMonth(year, month);
  });

  return totalDays;
}

function CategoryDetailSheet({
  isOpen,
  onClose,
  category,
  transactions,
  color,
  totalAmount,
}: {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
  transactions: TransactionWithCategory[];
  color: string;
  totalAmount: number;
}) {
  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(transactions),
    [transactions]
  );

  const totalDaysInMonths = useMemo(
    () => getTotalDaysInMonths(transactions),
    [transactions]
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl px-0">
        {/* Drag Handle */}
        <div className="flex justify-center pt-2 pb-3" data-drag-handle>
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
        </div>

        <SheetHeader className="px-5 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            {/* Category Icon */}
            <div
              className="size-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
              style={{
                backgroundColor: `${color}20`,
                boxShadow: `0 4px 20px ${color}30`,
              }}
            >
              {category.icon}
            </div>
            <div className="flex-1">
              <SheetTitle className="text-xl">{category.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-1">
                <span>{transactions.length} รายการ</span>
                <span className="text-muted-foreground/50">•</span>
                <span style={{ color }}>
                  ฿{totalAmount.toLocaleString()}
                </span>
              </SheetDescription>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="flex gap-2 mt-4 justify-center">
            <div className="wbg-muted/30 rounded-xl p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">รายการ</p>
              <p className="text-lg font-bold text-foreground">{transactions.length}</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">วัน</p>
              <p className="text-lg font-bold text-foreground">{groupedTransactions.length}</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">เฉลี่ย/วัน จาก {totalDaysInMonths} วัน</p>
              <p className="text-lg font-bold" style={{ color }}>
                ฿{totalDaysInMonths > 0 ? Math.round(totalAmount / totalDaysInMonths).toLocaleString() : '0'}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Transaction List by Date */}
        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          {groupedTransactions.map((group, groupIdx) => (
            <div key={group.dateKey} className="space-y-2">
              {/* Date Header */}
              <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm py-2 -mx-1 px-1 z-10">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm font-medium text-foreground">
                    {formatDateThai(group.date)}
                  </span>
                </div>
                <span className="text-sm font-semibold" style={{ color }}>
                  ฿{group.totalAmount.toLocaleString()}
                </span>
              </div>

              {/* Transactions */}
              <div className="space-y-1.5 pl-4 border-l-2 ml-0.5" style={{ borderColor: `${color}30` }}>
                {group.transactions.map((transaction, txIdx) => (
                  <div
                    key={transaction.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl',
                      'bg-card border border-border/30',
                      'transition-all duration-300 hover:bg-muted/30'
                    )}
                    style={{
                      animationDelay: `${groupIdx * 50 + txIdx * 30}ms`,
                    }}
                  >
                    {/* Transaction Icon */}
                    <div className="size-9 rounded-lg bg-muted/50 flex items-center justify-center">
                      {transaction.note ? (
                        <FileText className="size-4 text-muted-foreground" />
                      ) : (
                        <Receipt className="size-4 text-muted-foreground" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {transaction.note || category.name}
                        </p>
                        <CurrencyDisplay
                          amount={transaction.amount}
                          size="sm"
                          variant="expense"
                          className="font-semibold shrink-0"
                        />
                      </div>
                      {transaction.note && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {category.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {transactions.length === 0 && (
            <div className="py-12 text-center">
              <Receipt className="size-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">ไม่มีรายการ</p>
            </div>
          )}
        </div>

        {/* Bottom Total */}
        <div
          className="border-t border-border/50 px-5 py-4"
          style={{ backgroundColor: `${color}08` }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">รวมทั้งหมด</span>
            <span className="text-xl font-bold" style={{ color }}>
              ฿{totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CategoryList({
  summaries,
  transactions,
}: {
  summaries: CategorySummary[];
  transactions: TransactionWithCategory[];
}) {
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{
    category: Category;
    color: string;
    transactions: TransactionWithCategory[];
    totalAmount: number;
  } | null>(null);

  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, [summaries]);

  const handleCategoryClick = useCallback(
    (summary: CategorySummary, index: number) => {
      const categoryTransactions = transactions.filter(
        (t) => t.categoryId === summary.category.id && t.type === 'expense'
      );
      setSelectedCategory({
        category: summary.category,
        color: CHART_COLORS[index % CHART_COLORS.length],
        transactions: categoryTransactions,
        totalAmount: summary.amount,
      });
    },
    [transactions]
  );

  if (summaries.length === 0) {
    return (
      <div className="py-12 text-center">
        <PieChart className="size-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground text-sm">ไม่มีรายการในช่วงเวลานี้</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {summaries.map((summary, index) => (
          <button
            key={summary.category.id}
            onClick={() => handleCategoryClick(summary, index)}
            className={cn(
              'relative w-full overflow-hidden rounded-2xl bg-card border border-border/50',
              'transition-all duration-500 text-left',
              'hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            )}
            style={{
              transitionDelay: mounted ? `${index * 40}ms` : '0ms',
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.08] transition-all duration-500"
              style={{
                background: `linear-gradient(90deg, ${CHART_COLORS[index % CHART_COLORS.length]} ${summary.percentage}%, transparent ${summary.percentage}%)`,
              }}
            />
            <div className="relative flex items-center gap-3 p-3.5">
              <div
                className="shrink-0 size-11 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: `${CHART_COLORS[index % CHART_COLORS.length]}20` }}
              >
                {summary.category.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground truncate">{summary.category.name}</p>
                  <CurrencyDisplay amount={summary.amount} size="sm" variant="default" className="font-semibold" />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-muted-foreground">{summary.transactionCount} รายการ</span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${CHART_COLORS[index % CHART_COLORS.length]}15`,
                      color: CHART_COLORS[index % CHART_COLORS.length],
                    }}
                  >
                    {summary.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              {/* Chevron indicator */}
              <ChevronRight className="size-4 text-muted-foreground/50 shrink-0" />
            </div>
          </button>
        ))}
      </div>

      {/* Category Detail Sheet */}
      {selectedCategory && (
        <CategoryDetailSheet
          isOpen={!!selectedCategory}
          onClose={() => setSelectedCategory(null)}
          category={selectedCategory.category}
          transactions={selectedCategory.transactions}
          color={selectedCategory.color}
          totalAmount={selectedCategory.totalAmount}
        />
      )}
    </>
  );
}

// ============================================
// Main Component
// ============================================
export function AnalyticsTab() {
  const transactions = useTransactionStore((s) => s.transactions);
  const loadTransactions = useTransactionStore((s) => s.loadTransactions);
  const isInitialized = useTransactionStore((s) => s.isInitialized);
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const categoryInitialized = useCategoryStore((s) => s.isInitialized);

  useEffect(() => {
    if (!categoryInitialized) loadCategories();
  }, [categoryInitialized, loadCategories]);

  useEffect(() => {
    if (!isInitialized && categoryInitialized) loadTransactions();
  }, [isInitialized, categoryInitialized, loadTransactions]);

  // Current date
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // State
  const [filterMode, setFilterMode] = useState<FilterMode>('monthly');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonths, setSelectedMonths] = useState<MonthSelection[]>([
    { month: currentMonth, year: currentYear, key: getMonthKey(currentMonth, currentYear) }
  ]);

  // Available years
  const availableYears = useMemo(() => {
    const years = getAvailableYears(transactions);
    if (years.length === 0) return [currentYear];
    if (!years.includes(currentYear)) {
      years.unshift(currentYear);
      years.sort((a, b) => b - a);
    }
    return years;
  }, [transactions, currentYear]);

  // Check if current month is selected
  const isCurrentMonthSelected = useMemo(() => {
    if (filterMode === 'yearly') {
      return selectedYear === currentYear;
    }
    return selectedMonths.length === 1 &&
      selectedMonths[0].month === currentMonth &&
      selectedMonths[0].year === currentYear;
  }, [filterMode, selectedYear, selectedMonths, currentMonth, currentYear]);

  // Handlers
  const handleReset = useCallback(() => {
    setSelectedYear(currentYear);
    setFilterMode('monthly');
    setSelectedMonths([
      { month: currentMonth, year: currentYear, key: getMonthKey(currentMonth, currentYear) }
    ]);
  }, [currentMonth, currentYear]);

  const handleModeChange = useCallback((mode: FilterMode) => {
    setFilterMode(mode);
    if (mode === 'yearly') {
      // Select all months of the year
      const allMonths = Array.from({ length: 12 }, (_, i) => ({
        month: i,
        year: selectedYear,
        key: getMonthKey(i, selectedYear),
      }));
      setSelectedMonths(allMonths);
    } else {
      // Reset to current month
      setSelectedMonths([
        { month: currentMonth, year: selectedYear, key: getMonthKey(currentMonth, selectedYear) }
      ]);
    }
  }, [selectedYear, currentMonth]);

  const handleYearSelect = useCallback((year: number) => {
    setSelectedYear(year);
    if (filterMode === 'yearly') {
      const allMonths = Array.from({ length: 12 }, (_, i) => ({
        month: i,
        year: year,
        key: getMonthKey(i, year),
      }));
      setSelectedMonths(allMonths);
    } else {
      const defaultMonth = year === currentYear ? currentMonth : 0;
      setSelectedMonths([
        { month: defaultMonth, year, key: getMonthKey(defaultMonth, year) }
      ]);
    }
  }, [filterMode, currentMonth, currentYear]);

  const handleToggleMonth = useCallback((month: number) => {
    if (filterMode === 'yearly') return;

    setSelectedMonths((prev) => {
      const exists = prev.find((s) => s.month === month);
      if (exists) {
        if (prev.length === 1) return prev;
        return prev.filter((s) => s.month !== month);
      } else {
        const newSelection = [...prev, { month, year: selectedYear, key: getMonthKey(month, selectedYear) }];
        return newSelection.sort((a, b) => a.month - b.month);
      }
    });
  }, [filterMode, selectedYear]);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    if (filterMode === 'yearly') {
      // Navigate years
      const currentIndex = availableYears.indexOf(selectedYear);
      if (direction === 'prev' && currentIndex < availableYears.length - 1) {
        handleYearSelect(availableYears[currentIndex + 1]);
      } else if (direction === 'next' && currentIndex > 0) {
        handleYearSelect(availableYears[currentIndex - 1]);
      }
      return;
    }

    setSelectedMonths((prev) => {
      if (prev.length !== 1) return prev;

      const current = prev[0];
      let newMonth = current.month;
      let newYear = current.year;

      if (direction === 'prev') {
        if (newMonth === 0) {
          newMonth = 11;
          newYear -= 1;
        } else {
          newMonth -= 1;
        }
      } else {
        if (newMonth === 11) {
          newMonth = 0;
          newYear += 1;
        } else {
          newMonth += 1;
        }
      }

      if (newYear !== selectedYear) {
        setSelectedYear(newYear);
      }

      return [{ month: newMonth, year: newYear, key: getMonthKey(newMonth, newYear) }];
    });
  }, [filterMode, selectedYear, availableYears, handleYearSelect]);

  // Computed data
  const filteredTransactions = useMemo(() => {
    if (filterMode === 'yearly') {
      return filterByYear(transactions, selectedYear);
    }
    return filterByMonths(transactions, selectedMonths);
  }, [transactions, filterMode, selectedYear, selectedMonths]);

  const expenseSummaries = useMemo(
    () => computeCategorySummaries(filteredTransactions, 'expense'),
    [filteredTransactions]
  );

  const totalExpense = useMemo(
    () => expenseSummaries.reduce((sum, s) => sum + s.amount, 0),
    [expenseSummaries]
  );

  const chartKey = useMemo(() => {
    if (filterMode === 'yearly') return `year-${selectedYear}`;
    return selectedMonths.map((s) => s.key).join('-');
  }, [filterMode, selectedYear, selectedMonths]);

  const periodLabel = useMemo(() => {
    if (filterMode === 'yearly') {
      return `ปี พ.ศ. ${selectedYear + 543}`;
    }
    if (selectedMonths.length === 1) {
      return `${getFullMonthName(selectedMonths[0].month)} ${selectedMonths[0].year + 543}`;
    }
    if (selectedMonths.length === 12) {
      return `ทั้งปี ${selectedYear + 543}`;
    }
    const monthNames = selectedMonths.map((s) => getShortMonthName(s.month)).join(', ');
    return `${monthNames} ${selectedYear + 543}`;
  }, [filterMode, selectedMonths, selectedYear]);

  return (
    <>
      <Header
        leftAction={<h1 className="text-lg font-semibold text-foreground">สถิติ</h1>}
        rightAction={
          !isCurrentMonthSelected && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <RotateCcw className="size-3.5" />
              <span>วันนี้</span>
            </button>
          )
        }
      />

      <PageContainer className="pt-4 space-y-5">
        {/* Filter Section - Expandable */}
        <div className="bg-linear-to-br from-card to-muted/20 rounded-2xl border border-border/50 overflow-hidden">
          {/* Filter Header */}
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="size-5 text-primary" />
              <span className="font-medium text-foreground">ตัวกรอง</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {periodLabel}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'size-5 text-muted-foreground transition-transform duration-200',
                isFilterExpanded && 'rotate-180'
              )}
            />
          </button>

          {/* Filter Content */}
          <div
            className={cn(
              'grid transition-all duration-300 ease-in-out',
              isFilterExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            )}
          >
            <div className="overflow-hidden">
              <div className="p-4 pt-0 space-y-4">
                {/* Mode Toggle */}
                <FilterModeToggle mode={filterMode} onModeChange={handleModeChange} />

                {/* Year Selector */}
                <YearSelector
                  years={availableYears}
                  selectedYear={selectedYear}
                  onSelect={handleYearSelect}
                  showFullYear={filterMode === 'yearly'}
                />

                {/* Month Selector (only for monthly mode) */}
                {filterMode === 'monthly' && (
                  <MonthMultiSelector
                    selectedYear={selectedYear}
                    selectedMonths={selectedMonths}
                    onToggleMonth={handleToggleMonth}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    onNavigate={handleNavigate}
                  />
                )}

                {/* Yearly mode summary */}
                {filterMode === 'yearly' && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <button
                      onClick={() => handleNavigate('prev')}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <ChevronLeft className="size-5 text-muted-foreground" />
                    </button>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">
                        พ.ศ. {selectedYear + 543}
                      </p>
                      <p className="text-xs text-muted-foreground">ข้อมูลทั้งปี (12 เดือน)</p>
                    </div>
                    <button
                      onClick={() => handleNavigate('next')}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <ChevronRight className="size-5 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Donut Chart Section */}
        <div className="bg-linear-to-br from-card via-card to-muted/20 rounded-3xl p-5 border border-border/50 shadow-lg shadow-black/5">
          <div className="text-center mb-4">
            <h2 className="font-semibold text-foreground">รายจ่ายตามหมวดหมู่</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{periodLabel}</p>
          </div>

          <DonutChart
            summaries={expenseSummaries}
            totalAmount={totalExpense}
            centerLabel="รวมรายจ่าย"
            chartKey={chartKey}
          />

        </div>

        {/* Category List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">รายละเอียดหมวดหมู่</h3>
            <span className="text-xs text-muted-foreground">{expenseSummaries.length} หมวดหมู่</span>
          </div>
          <CategoryList summaries={expenseSummaries} transactions={filteredTransactions} />
        </div>
      </PageContainer>
    </>
  );
}
