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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  // Category store for adding new categories
  const addCategory = useCategoryStore((s) => s.addCategory);

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
      setShowDatePicker(false);
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
        className="h-[75vh] rounded-t-[2rem] px-0 pb-0 overflow-hidden border-t-0"
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
          <div data-drag-handle className="flex justify-center pt-2 pb-3 touch-none">
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
            label="หมวดหมู่"
          />

          {/* Amount Display */}
          <div className="px-4 ">
            <div
              className={cn(
                "relative overflow-hidden rounded-2xl px-3 pb-safe pt-3 transition-all",
                "bg-linear-to-br from-card to-muted/20",
                "border border-border/50 shadow-sm"
              )}
            >
              {/* Selected Info */}
              {selectedCategory && (
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-muted/60 text-xs font-semibold">
                      {selectedCategory.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {selectedCategory.name}
                    </span>
                  </div>
                  {calculator.previousValue && calculator.operation && (
                    <span className="text-xs text-muted-foreground">
                      {formatNumber(parseFloat(calculator.previousValue))} {calculator.operation}
                    </span>
                  )}
                </div>
              )}

              {/* Amount */}
              <div className="flex items-baseline justify-end gap-1">
                <span className={cn(
                  "text-xl font-medium",
                  transactionType === 'expense' && "text-expense/70",
                  transactionType === 'income' && "text-income/70"
                )}>
                  {currency}
                </span>
                <span
                  className={cn(
                    "font-mono text-4xl font-bold tracking-tight",
                    parseFloat(calculator.displayValue) > 0 ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {calculator.formatDisplay(calculator.displayValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Date & Note */}
          <div className="flex gap-2 px-4 pb-2">
            {/* Date Selector */}
            <div className="flex items-center gap-1 rounded-xl bg-muted/50 px-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => changeDate(-1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium"
              >
                <Calendar className="size-3.5 text-muted-foreground" />
                {formatRelativeDate(selectedDate)}
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => changeDate(1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            {/* Note Input */}
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-muted/50 px-3">
              <FileText className="size-3.5 text-muted-foreground shrink-0" />
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="บันทึก..."
                className="h-8 border-0 bg-transparent p-0 text-xs focus-visible:ring-0"
              />
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
