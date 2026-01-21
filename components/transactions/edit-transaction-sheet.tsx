'use client';

import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Category, TransactionType, TransactionWithCategory, CategoryType } from '@/types';
import { formatNumber, formatRelativeDate } from '@/lib/utils/format';
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
  FileText,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

interface EditTransactionSheetProps {
  transaction: TransactionWithCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseCategories: Category[];
  incomeCategories: Category[];
  onUpdate: (id: string, data: {
    type?: TransactionType;
    amount?: number;
    categoryId?: string;
    date?: Date;
    note?: string;
  }) => void;
  onDelete: (id: string) => void;
}

export function EditTransactionSheet({
  transaction,
  open,
  onOpenChange,
  expenseCategories,
  incomeCategories,
  onUpdate,
  onDelete,
}: EditTransactionSheetProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  // Category store for adding new categories, reordering, and deleting
  const addCategory = useCategoryStore((s) => s.addCategory);
  const reorderCategories = useCategoryStore((s) => s.reorderCategories);
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);

  // Calculator hook
  const calculator = useCalculator();
  const currency = '฿';

  // Initialize from transaction
  useEffect(() => {
    if (transaction && open) {
      setTransactionType(transaction.type);
      setSelectedCategory(transaction.category);
      setNote(transaction.note || '');
      setSelectedDate(transaction.date);
      calculator.setDisplayValue(transaction.amount.toString());
      calculator.reset();
      calculator.setDisplayValue(transaction.amount.toString());
      setShowDeleteConfirm(false);
    }
  }, [transaction, open]);

  const currentCategories = transactionType === 'income' ? incomeCategories : expenseCategories;

  const handleTypeChange = (type: TransactionType) => {
    setTransactionType(type);
    // Reset category if type changed
    if (type !== transactionType) {
      const cats = type === 'income' ? incomeCategories : expenseCategories;
      setSelectedCategory(cats[0] || null);
    }
  };

  const handleAddCategory = async (name: string, type: CategoryType) => {
    const newCategory = await addCategory({ name, type });
    setSelectedCategory(newCategory);
  };

  const handleSave = () => {
    if (!transaction || !selectedCategory || parseFloat(calculator.displayValue) <= 0) return;

    onUpdate(transaction.id, {
      type: transactionType,
      amount: parseFloat(calculator.displayValue),
      categoryId: selectedCategory.id,
      date: selectedDate,
      note: note || undefined,
    });

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!transaction) return;
    onDelete(transaction.id);
    onOpenChange(false);
  };

  const canSave = !!(selectedCategory && parseFloat(calculator.displayValue) > 0);

  // Date navigation
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  if (!transaction) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="min-h-[72vh] rounded-t-[2rem] px-0 pb-0 overflow-hidden border-t-0"
      >
        <SheetTitle className="sr-only">แก้ไขรายการ</SheetTitle>

        {/* Header */}
        <div className="relative">
          {/* Gradient background */}
          <div
            className={cn(
              "absolute inset-0 h-40 opacity-15 transition-all duration-300",
              transactionType === 'expense' && "bg-linear-to-b from-expense via-expense/50 to-transparent",
              transactionType === 'income' && "bg-linear-to-b from-income via-income/50 to-transparent"
            )}
          />
          {/* Handle bar */}
          <div data-drag-handle className="flex justify-center pt-2 pb-2 touch-none">
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Top bar */}
          <div className="relative flex items-center justify-between px-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="size-5" />
            </Button>

            <span className="text-sm font-semibold text-foreground/80">
              แก้ไขรายการ
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => onOpenChange(false)}
            >
            </Button>

          </div>

          {/* Transaction Type Pills */}
          <TypeSelector
            value={transactionType}
            onChange={handleTypeChange}
            showIcons={false}
          />
        </div>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="mx-6 w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                  <AlertTriangle className="size-8 text-destructive" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  ลบรายการนี้?
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  การดำเนินการนี้ไม่สามารถย้อนกลับได้
                </p>
                <div className="flex w-full gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 rounded-xl"
                    onClick={handleDelete}
                  >
                    <Trash2 className="size-4 mr-2" />
                    ลบ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex h-[calc(100%-100px)] flex-col">
          {/* Category Scroll */}
          <CategoryScroll
            categories={currentCategories}
            selectedCategory={selectedCategory}
            transactionType={transactionType}
            onSelect={setSelectedCategory}
            onAddNew={() => setAddCategoryOpen(true)}
            onReorderCategories={(cats) => reorderCategories(transactionType, cats)}
            onAddCategory={handleAddCategory}
            onDeleteCategory={deleteCategory}
            label="หมวดหมู่"
          />

          {/* Amount Display - Split Layout Card */}
          <div className="px-3 py-1">
            <div
              className={cn(
                "relative overflow-hidden rounded-2xl transition-all duration-300",
                "bg-linear-to-br from-card via-card to-muted/20",
                "border border-border/50 shadow-sm"
              )}
            >
              {/* Split Layout Container */}
              <div className="flex w-full">
                {/* Left Half - Category Badge & Quick Actions */}
                <div className="w-3/5 flex flex-col justify-between p-3 border-r border-border/30">

                  {/* Date Selector with Navigation */}
                  <div className="flex items-center gap-0.5 mt-2 px-1 py-0.5 rounded-lg bg-muted/40">
                    <button
                      onClick={() => changeDate(-1)}
                      className="flex items-center justify-center size-6 rounded-md hover:bg-muted transition-colors active:scale-95"
                    >
                      <ChevronLeft className="size-3.5 text-muted-foreground" />
                    </button>
                    <button
                      className="flex-1 flex items-center justify-center gap-1 px-1 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Calendar className="size-3" />
                      <span>{formatRelativeDate(selectedDate)}</span>
                    </button>
                    <button
                      onClick={() => changeDate(1)}
                      className="flex items-center justify-center size-6 rounded-md hover:bg-muted transition-colors active:scale-95"
                    >
                      <ChevronRight className="size-3.5 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Note Input - Compact */}
                  <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 rounded-lg bg-muted/30 transition-all focus-within:bg-muted/50 focus-within:ring-1 focus-within:ring-primary/30">
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

          {/* Calculator */}
          <CalculatorKeypad
            operation={calculator.operation}
            transactionType={transactionType}
            canSubmit={canSave}
            onNumber={calculator.handleNumber}
            onDecimal={calculator.handleDecimal}
            onOperation={calculator.handleOperation}
            onEquals={calculator.handleEquals}
            onClear={calculator.handleClear}
            onBackspace={calculator.handleBackspace}
            onSubmit={handleSave}
            showSparkle={false}
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
