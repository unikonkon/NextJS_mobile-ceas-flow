'use client';

import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback, useRef } from 'react';
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
  Calendar,
  FileText,
  Trash2,
  Check,
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

type Operation = '+' | '-' | '×' | '÷' | null;

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

  // Calculator state
  const [displayValue, setDisplayValue] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const currency = '฿';

  // Initialize from transaction
  useEffect(() => {
    if (transaction && open) {
      setTransactionType(transaction.type);
      setSelectedCategory(transaction.category);
      setNote(transaction.note || '');
      setSelectedDate(transaction.date);
      setDisplayValue(transaction.amount.toString());
      setPreviousValue(null);
      setOperation(null);
      setShouldResetDisplay(false);
      setShowDeleteConfirm(false);
      setShowDatePicker(false);
    }
  }, [transaction, open]);

  const currentCategories = transactionType === 'income' ? incomeCategories : expenseCategories;

  // Calculator functions
  const calculate = useCallback(() => {
    if (!previousValue || !operation) return displayValue;

    const prev = parseFloat(previousValue);
    const current = parseFloat(displayValue);

    let result: number;
    switch (operation) {
      case '+': result = prev + current; break;
      case '-': result = prev - current; break;
      case '×': result = prev * current; break;
      case '÷': result = current !== 0 ? prev / current : 0; break;
      default: return displayValue;
    }

    return result.toString();
  }, [previousValue, displayValue, operation]);

  const handleNumber = (num: string) => {
    let newValue: string;

    if (shouldResetDisplay || displayValue === '0') {
      newValue = num;
      setShouldResetDisplay(false);
    } else {
      if (displayValue.replace('.', '').length >= 12) return;
      newValue = displayValue + num;
    }

    setDisplayValue(newValue);
  };

  const handleDecimal = () => {
    if (shouldResetDisplay) {
      setDisplayValue('0.');
      setShouldResetDisplay(false);
      return;
    }
    if (displayValue.includes('.')) return;
    setDisplayValue(displayValue + '.');
  };

  const handleOperation = (op: Operation) => {
    if (previousValue && operation && !shouldResetDisplay) {
      const result = calculate();
      setDisplayValue(result);
      setPreviousValue(result);
    } else {
      setPreviousValue(displayValue);
    }
    setOperation(op);
    setShouldResetDisplay(true);
  };

  const handleEquals = () => {
    if (!previousValue || !operation) return;

    const result = calculate();
    setDisplayValue(result);
    setPreviousValue(null);
    setOperation(null);
    setShouldResetDisplay(true);
  };

  const handleClear = () => {
    setDisplayValue('0');
    setPreviousValue(null);
    setOperation(null);
    setShouldResetDisplay(false);
  };

  const handleBackspace = () => {
    if (shouldResetDisplay || displayValue === '0' || displayValue.length === 1) {
      setDisplayValue('0');
      return;
    }
    setDisplayValue(displayValue.slice(0, -1) || '0');
  };

  const formatDisplay = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '0';
    if (val.endsWith('.')) return formatNumber(num) + '.';
    if (val.includes('.')) {
      const parts = val.split('.');
      return formatNumber(parseFloat(parts[0])) + '.' + parts[1];
    }
    return formatNumber(num);
  };

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
    // Auto-select the newly created category
    setSelectedCategory(newCategory);
  };

  const handleSave = () => {
    if (!transaction || !selectedCategory || parseFloat(displayValue) <= 0) return;

    onUpdate(transaction.id, {
      type: transactionType,
      amount: parseFloat(displayValue),
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

  const canSave = selectedCategory && parseFloat(displayValue) > 0;

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
              transactionType === 'income' && "bg-linear-to-b from-income via-income/50 to-transparent",
              transactionType === 'transfer' && "bg-linear-to-b from-transfer via-transfer/50 to-transparent"
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
          <div className="relative px-4 pb-4">
            <div className="flex justify-center">
              <div className="inline-flex rounded-2xl bg-muted/60 p-1 backdrop-blur-sm">
                {[
                  { type: 'expense' as TransactionType, label: 'รายจ่าย' },
                  { type: 'income' as TransactionType, label: 'รายรับ' },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleTypeChange(item.type)}
                    className={cn(
                      "relative px-6 py-2 text-sm font-medium rounded-xl transition-all duration-300",
                      transactionType === item.type
                        ? "text-white shadow-lg"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {transactionType === item.type && (
                      <div
                        className={cn(
                          "absolute inset-0 rounded-xl",
                          item.type === 'expense' && "bg-expense",
                          item.type === 'income' && "bg-income"
                        )}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
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
          <div className="border-b border-border/50">
            <div className="mb-2 flex items-center justify-between px-4">
              <span className="text-xs font-medium text-muted-foreground">หมวดหมู่</span>
              {selectedCategory && (
                <span className={cn(
                  "flex items-center gap-1 text-xs font-semibold",
                  transactionType === 'expense' && "text-expense",
                  transactionType === 'income' && "text-income"
                )}>
                  <Check className="size-3" />
                  {selectedCategory.name}
                </span>
              )}
            </div>

            <div
              ref={categoryScrollRef}
              className="flex gap-2 overflow-x-auto px-4 py-1 scrollbar-hide"
            >
              {currentCategories.map((category) => {
                const isSelected = category.id === selectedCategory?.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "group flex shrink-0 flex-col items-center gap-1.5 rounded-xl px-3 py-1 transition-all duration-200",
                      "hover:bg-accent/50 active:scale-95",
                      isSelected && cn(
                        "ring-2 shadow-lg",
                        transactionType === 'expense' && "bg-expense/10 ring-expense/50",
                        transactionType === 'income' && "bg-income/10 ring-income/50"
                      )
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl text-base font-semibold transition-all",
                        "bg-muted/60",
                        isSelected && "scale-110 bg-white dark:bg-card shadow-md"
                      )}
                    >
                      {category.name.charAt(0)}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-medium text-muted-foreground whitespace-nowrap",
                        isSelected && "text-foreground font-semibold"
                      )}
                    >
                      {category.name}
                    </span>
                  </button>
                );
              })}

              {/* Add New Category */}
              <button
                onClick={() => setAddCategoryOpen(true)}
                className="group flex shrink-0 flex-col items-center gap-1.5 rounded-xl px-3 py-1 transition-all hover:bg-accent/50 active:scale-95"
              >
                <div className="flex size-10 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 transition-colors group-hover:border-primary/50">
                  <span className="text-base text-muted-foreground group-hover:text-primary">+</span>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                  เพิ่มใหม่
                </span>
              </button>
            </div>
          </div>

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
                  {previousValue && operation && (
                    <span className="text-xs text-muted-foreground">
                      {formatNumber(parseFloat(previousValue))} {operation}
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
                    parseFloat(displayValue) > 0 ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {formatDisplay(displayValue)}
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
          <div className="mt-auto bg-muted/30 px-3 pb-safe pt-3">
            <div className="grid grid-cols-4 gap-1.5">
              {/* Row 1 */}
              <CalcButton label="C" onClick={handleClear} variant="secondary" />
              <CalcButton
                label="÷"
                onClick={() => handleOperation('÷')}
                variant="secondary"
                isActive={operation === '÷'}
              />
              <CalcButton
                label="×"
                onClick={() => handleOperation('×')}
                variant="secondary"
                isActive={operation === '×'}
              />
              <CalcButton label="⌫" onClick={handleBackspace} variant="secondary" />

              {/* Row 2 */}
              <CalcButton label="7" onClick={() => handleNumber('7')} />
              <CalcButton label="8" onClick={() => handleNumber('8')} />
              <CalcButton label="9" onClick={() => handleNumber('9')} />
              <CalcButton
                label="-"
                onClick={() => handleOperation('-')}
                variant="secondary"
                isActive={operation === '-'}
              />

              {/* Row 3 */}
              <CalcButton label="4" onClick={() => handleNumber('4')} />
              <CalcButton label="5" onClick={() => handleNumber('5')} />
              <CalcButton label="6" onClick={() => handleNumber('6')} />
              <CalcButton
                label="+"
                onClick={() => handleOperation('+')}
                variant="secondary"
                isActive={operation === '+'}
              />

              {/* Row 4 */}
              <CalcButton label="1" onClick={() => handleNumber('1')} />
              <CalcButton label="2" onClick={() => handleNumber('2')} />
              <CalcButton label="3" onClick={() => handleNumber('3')} />
              <CalcButton
                label="="
                onClick={handleEquals}
                variant="secondary"
                className="bg-muted"
              />

              {/* Row 5 */}
              <CalcButton label="00" onClick={() => { handleNumber('0'); handleNumber('0'); }} />
              <CalcButton label="0" onClick={() => handleNumber('0')} />
              <CalcButton label="." onClick={handleDecimal} />

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!canSave}
                className={cn(
                  "relative flex h-12 items-center justify-center gap-2 rounded-xl font-semibold text-white transition-all duration-300",
                  "active:scale-95 disabled:opacity-40 disabled:active:scale-100",
                  canSave && "shadow-lg",
                  transactionType === 'expense' && "bg-expense shadow-expense/30 hover:bg-expense/90",
                  transactionType === 'income' && "bg-income shadow-income/30 hover:bg-income/90"
                )}
              >
                <Check className="size-5" />
                <span className="text-sm">บันทึก</span>
              </button>
            </div>
          </div>
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

// Calculator Button
function CalcButton({
  label,
  onClick,
  variant = 'default',
  isActive = false,
  className,
}: {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'secondary';
  isActive?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-12 items-center justify-center rounded-xl text-lg font-semibold transition-all duration-150",
        "active:scale-95 active:bg-accent",
        variant === 'default' && "bg-card hover:bg-accent text-foreground",
        variant === 'secondary' && "bg-muted/60 hover:bg-muted text-muted-foreground",
        isActive && "ring-2 ring-primary bg-primary/10 text-primary",
        className
      )}
    >
      {label}
    </button>
  );
}
