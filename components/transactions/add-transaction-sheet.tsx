'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Category, TransactionType, CategoryType } from '@/types';
import { formatNumber } from '@/lib/utils/format';
import { AddCategoryModal } from '@/components/categories';
import { useCategoryStore } from '@/lib/stores';
import {
  useCalculator,
  TypeSelector,
  CategoryScroll,
  CalculatorKeypad,
} from './ui-transactions';
import {
  Calendar,
  Wallet,
  FileText,
} from 'lucide-react';

interface AddTransactionSheetProps {
  trigger: React.ReactNode;
  expenseCategories: Category[];
  incomeCategories: Category[];
  onSubmit?: (data: {
    type: TransactionType;
    amount: number;
    categoryId: string;
    note?: string;
  }) => void;
}

export function AddTransactionSheet({
  trigger,
  expenseCategories,
  incomeCategories,
  onSubmit,
}: AddTransactionSheetProps) {
  const [open, setOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [note, setNote] = useState('');
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  // Category store for adding new categories, reordering, and deleting
  const addCategory = useCategoryStore((s) => s.addCategory);
  const reorderCategories = useCategoryStore((s) => s.reorderCategories);
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);

  // Calculator hook
  const calculator = useCalculator();
  const currency = '฿';

  // Get current categories based on type
  const currentCategories = transactionType === 'income' ? incomeCategories : expenseCategories;

  const handleTypeChange = (type: TransactionType) => {
    setTransactionType(type);
    setSelectedCategory(null);
  };

  const handleAddCategory = async (name: string, type: CategoryType) => {
    const newCategory = await addCategory({ name, type });
    setSelectedCategory(newCategory);
  };

  const handleSubmit = () => {
    if (selectedCategory && parseFloat(calculator.displayValue) > 0) {
      onSubmit?.({
        type: transactionType,
        amount: parseFloat(calculator.displayValue),
        categoryId: selectedCategory.id,
        note: note || undefined,
      });

      // Reset form
      calculator.reset();
      setSelectedCategory(null);
      setNote('');
      setOpen(false);
    }
  };

  const canSubmit = !!(selectedCategory && parseFloat(calculator.displayValue) > 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="min-h-[72vh] rounded-t-[2rem] px-0 pb-0 overflow-hidden border-t-0"
      >
        {/* Hidden title for accessibility */}
        <SheetTitle className="sr-only">เพิ่มรายการ</SheetTitle>

        {/* Elegant Header with gradient */}
        <div className="relative">
          {/* Decorative gradient background */}
          <div
            className={cn(
              "absolute inset-0  opacity-20 transition-all duration-100",
              transactionType === 'expense' && "bg-linear-to-b from-expense via-expense/50 to-transparent",
              transactionType === 'income' && "bg-linear-to-b from-income via-income/50 to-transparent"
            )}
          />

          {/* Handle bar */}
          <div data-drag-handle className="flex justify-center pt-2 pb-2 touch-none">
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Transaction Type Selector */}
          <TypeSelector
            value={transactionType}
            onChange={handleTypeChange}
            showIcons={true}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col">
          {/* Category Horizontal Scroll */}
          <CategoryScroll
            categories={currentCategories}
            selectedCategory={selectedCategory}
            transactionType={transactionType}
            onSelect={setSelectedCategory}
            onAddNew={() => setAddCategoryOpen(true)}
            onReorderCategories={(cats) => reorderCategories(transactionType, cats)}
            onAddCategory={handleAddCategory}
            onDeleteCategory={deleteCategory}
          />

          {/* Amount Display - Split Layout Card */}
          <div className="px-1 py-2">
            <div
              className={cn(
                "relative overflow-hidden rounded-xl transition-all duration-300",
                "bg-linear-to-br from-card via-card to-muted/20",
                "border border-border/50 shadow-sm",
                selectedCategory && "ring-2 ring-primary/20"
              )}
            >
              {/* Split Layout Container */}
              <div className="flex w-full">
                {/* Left Half - Category Badge & Quick Actions */}
                <div className="w-3/5 flex flex-col justify-between p-2 border-r border-border/30">

                  {/* Quick Actions Row */}
                  <div className="flex gap-1.5">
                    <button
                      className={cn(
                        "flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all",
                        "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
                        "active:scale-95"
                      )}
                    >
                      <Calendar className="size-3" />
                      <span>วันนี้</span>
                    </button>
                    <button
                      className={cn(
                        "flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all",
                        "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
                        "active:scale-95"
                      )}
                    >
                      <Wallet className="size-3" />
                      <span>เงินสด</span>
                    </button>
                  </div>

                  {/* Note Input - Compact */}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/30 transition-all focus-within:bg-muted/50 focus-within:ring-1 focus-within:ring-primary/30">
                    <FileText className="size-3 text-muted-foreground/60 shrink-0" />
                    <Input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="บันทึก..."
                      className="h-5 border-0 bg-transparent p-0 text-[11px] focus-visible:ring-0 placeholder:text-muted-foreground/40"
                    />
                  </div>
                </div>

                {/* Right Half - Amount Display */}
                <div className="w-2/5 flex flex-col justify-between p-3">
                  {/* Operation Indicator */}
                  <div className="flex justify-end">
                    {calculator.previousValue && calculator.operation ? (
                      <span className="text-xs text-muted-foreground font-medium animate-in fade-in slide-in-from-right-2">
                        {formatNumber(parseFloat(calculator.previousValue))} {calculator.operation}
                      </span>
                    ) : (
                      <span className="text-xs text-transparent select-none">-</span>
                    )}
                  </div>

                  {/* Main Amount Display */}
                  <div className="flex items-baseline justify-end gap-0.5 mt-auto">
                    {/* <span
                      className={cn(
                        "text-lg font-semibold transition-colors",
                        transactionType === 'expense' && "text-expense/60",
                        transactionType === 'income' && "text-income/60"
                      )}
                    >
                      {currency}
                    </span> */}
                    <span
                      className={cn(
                        "font-numbers text-2xl font-bold tracking-tight transition-all",
                        parseFloat(calculator.displayValue) > 0
                          ? "text-foreground"
                          : "text-muted-foreground/40"
                      )}
                    >
                      {calculator.formatDisplay(calculator.displayValue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calculator Keypad */}
          <CalculatorKeypad
            operation={calculator.operation}
            transactionType={transactionType}
            canSubmit={canSubmit}
            onNumber={calculator.handleNumber}
            onOperation={calculator.handleOperation}
            onEquals={calculator.handleEquals}
            onClear={calculator.handleClear}
            onBackspace={calculator.handleBackspace}
            onSubmit={handleSubmit}
            showSparkle={true}
          />
        </div>

        {/* Add Category Modal */}
        <AddCategoryModal
          open={addCategoryOpen}
          onOpenChange={setAddCategoryOpen}
          categoryType={transactionType === 'income' ? 'income' : 'expense'}
          onAdd={handleAddCategory}
        />
      </SheetContent>
    </Sheet>
  );
}
