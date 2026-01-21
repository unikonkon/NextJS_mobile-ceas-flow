'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
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
  ImagePlus,
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

  // Category store for adding new categories
  const addCategory = useCategoryStore((s) => s.addCategory);

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
        className="h-[77vh] rounded-t-[2rem] px-0 pb-0 overflow-hidden border-t-0"
      >
        {/* Hidden title for accessibility */}
        <SheetTitle className="sr-only">เพิ่มรายการ</SheetTitle>

        {/* Elegant Header with gradient */}
        <div className="relative">
          {/* Decorative gradient background */}
          <div
            className={cn(
              "absolute inset-0 h-32 opacity-20 transition-all duration-100",
              transactionType === 'expense' && "bg-linear-to-b from-expense via-expense/50 to-transparent",
              transactionType === 'income' && "bg-linear-to-b from-income via-income/50 to-transparent"
            )}
          />

          {/* Handle bar */}
          <div data-drag-handle className="flex justify-center pt-2 pb-3 touch-none">
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
        <div className="flex h-[calc(100%-80px)] flex-col">
          {/* Category Horizontal Scroll */}
          <CategoryScroll
            categories={currentCategories}
            selectedCategory={selectedCategory}
            transactionType={transactionType}
            onSelect={setSelectedCategory}
            onAddNew={() => setAddCategoryOpen(true)}
          />

          {/* Amount Display - Elegant Card */}
          <div className="px-4 py-2">
            <div
              className={cn(
                "relative overflow-hidden rounded-2xl p-4 transition-all duration-300",
                "bg-linear-to-br from-card via-card to-muted/30",
                "border border-border/50 shadow-sm",
                selectedCategory && "ring-2 ring-primary/20"
              )}
            >
              {/* Selected Category Badge */}
              {selectedCategory && (
                <div className="absolute left-4 top-4 flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted/80 text-sm font-medium shadow-sm">
                    {selectedCategory.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {selectedCategory.name}
                  </span>
                </div>
              )}

              {/* Operation Indicator */}
              {calculator.previousValue && calculator.operation && (
                <div className={cn(
                  "absolute right-4 top-4 text-xs text-muted-foreground",
                  !selectedCategory && "left-4"
                )}>
                  {formatNumber(parseFloat(calculator.previousValue))} {calculator.operation}
                </div>
              )}

              {/* Main Amount Display */}
              <div className={cn(
                "flex items-baseline justify-end gap-1 pt-4",
                selectedCategory && ""
              )}>
                <span className={cn(
                  "text-xl font-medium transition-colors",
                  transactionType === 'expense' && "text-expense/70",
                  transactionType === 'income' && "text-income/70"
                )}>
                  {currency}
                </span>
                <span
                  className={cn(
                    "font-numbers text-4xl font-bold tracking-tight transition-all",
                    parseFloat(calculator.displayValue) > 0 ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {calculator.formatDisplay(calculator.displayValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions + Note */}
          <div className="flex gap-2 px-4">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs">
              <Calendar className="size-3.5" />
              วันนี้
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs">
              <Wallet className="size-3.5" />
              เงินสด
            </Button>
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-muted/50 px-3">
              <FileText className="size-3.5 text-muted-foreground" />
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="บันทึก..."
                className="h-8 border-0 bg-transparent p-0 text-xs focus-visible:ring-0"
              />
            </div>
          </div>

          {/* Calculator Keypad */}
          <CalculatorKeypad
            operation={calculator.operation}
            transactionType={transactionType}
            canSubmit={canSubmit}
            onNumber={calculator.handleNumber}
            onDecimal={calculator.handleDecimal}
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
