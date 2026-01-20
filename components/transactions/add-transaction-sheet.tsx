'use client';

import { cn } from '@/lib/utils';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Category, TransactionType, CategoryType } from '@/types';
import { formatNumber } from '@/lib/utils/format';
import { AddCategoryModal } from '@/components/categories';
import { useCategoryStore } from '@/lib/stores';
import {
  Calendar,
  Wallet,
  FileText,
  ImagePlus,
  Check,
  Sparkles
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

type Operation = '+' | '-' | '×' | '÷' | null;

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

  // Calculator state
  const [displayValue, setDisplayValue] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const currency = '฿';

  // Get current categories based on type
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
    setSelectedCategory(null);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleAddCategory = async (name: string, type: CategoryType) => {
    const newCategory = await addCategory({ name, type });
    // Auto-select the newly created category
    setSelectedCategory(newCategory);
  };

  const handleSubmit = () => {
    if (selectedCategory && parseFloat(displayValue) > 0) {
      onSubmit?.({
        type: transactionType,
        amount: parseFloat(displayValue),
        categoryId: selectedCategory.id,
        note: note || undefined,
      });

      // Reset form
      setDisplayValue('0');
      setPreviousValue(null);
      setOperation(null);
      setSelectedCategory(null);
      setNote('');
      setOpen(false);
    }
  };

  const canSubmit = selectedCategory && parseFloat(displayValue) > 0;

  // Auto scroll to selected category
  useEffect(() => {
    if (selectedCategory && categoryScrollRef.current) {
      const selectedEl = categoryScrollRef.current.querySelector(`[data-category-id="${selectedCategory.id}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedCategory]);

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
              transactionType === 'income' && "bg-linear-to-b from-income via-income/50 to-transparent",
              transactionType === 'transfer' && "bg-linear-to-b from-transfer via-transfer/50 to-transparent"
            )}
          />

          {/* Handle bar */}
          <div data-drag-handle className="flex justify-center pt-2 pb-3 touch-none">
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Transaction Type Selector - Pill Style */}
          <div className="relative px-4 pb-4">
            <div className="flex justify-center">
              <div className="inline-flex rounded-2xl bg-muted/60 p-1 backdrop-blur-sm">
                {[
                  { type: 'expense' as TransactionType, label: 'รายจ่าย', icon: '💸' },
                  { type: 'income' as TransactionType, label: 'รายรับ', icon: '💰' },
                  { type: 'transfer' as TransactionType, label: 'โอนเงิน', icon: '🔄' },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleTypeChange(item.type)}
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300",
                      transactionType === item.type
                        ? "text-white shadow-lg"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {transactionType === item.type && (
                      <div
                        className={cn(
                          "absolute inset-0 rounded-xl transition-all duration-300",
                          item.type === 'expense' && "bg-expense shadow-expense/30",
                          item.type === 'income' && "bg-income shadow-income/30",
                          item.type === 'transfer' && "bg-transfer shadow-transfer/30"
                        )}
                      />
                    )}
                    <span className="relative z-10">{item.icon}</span>
                    <span className="relative z-10">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex h-[calc(100%-80px)] flex-col">

          {/* Category Horizontal Scroll */}
          <div className="border-b border-border/50 ">
            <div className="mb-2 flex items-center justify-between px-4">
              <span className="text-xs font-medium text-muted-foreground">เลือกหมวดหมู่</span>
              {selectedCategory && (
                <span className={cn(
                  "flex items-center gap-1 text-xs font-semibold animate-in slide-in-from-right-2",
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
              className="flex gap-2 overflow-x-auto px-4 py-1 scrollbar-hide scroll-smooth"
            >
              {currentCategories.map((category, index) => {
                const isSelected = category.id === selectedCategory?.id;
                return (
                  <button
                    key={category.id}
                    data-category-id={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className={cn(
                      "relative px-3 text-sm font-medium rounded-xl transition-all duration-300",
                      "hover:bg-accent/50 active:scale-95",
                      isSelected && cn(
                        "ring-2 shadow-lg",
                        transactionType === 'expense' && "bg-expense/10 ring-expense/50 shadow-expense/20",
                        transactionType === 'income' && "bg-income/10 ring-income/50 shadow-income/20"
                      )
                    )}
                    style={{
                      animationDelay: `${index * 30}ms`
                    }}
                  >
                    <div
                      className={cn(
                        "flex size-11 items-center justify-center rounded-xl text-lg font-medium transition-transform",
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
                className="group flex shrink-0 flex-col items-center gap-1.5 rounded-2xl px-3 py-2.5 transition-all hover:bg-accent/50 active:scale-95"
              >
                <div className="flex size-11 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 transition-colors group-hover:border-primary/50">
                  <span className="text-lg text-muted-foreground group-hover:text-primary">+</span>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                  เพิ่มใหม่
                </span>
              </button>
            </div>
          </div>

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
              {previousValue && operation && (
                <div className={cn(
                  "absolute right-4 top-4 text-xs text-muted-foreground",
                  !selectedCategory && "left-4"
                )}>
                  {formatNumber(parseFloat(previousValue))} {operation}
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
                  transactionType === 'income' && "text-income/70",
                  transactionType === 'transfer' && "text-transfer/70"
                )}>
                  {currency}
                </span>
                <span
                  className={cn(
                    "font-numbers text-4xl font-bold tracking-tight transition-all",
                    parseFloat(displayValue) > 0 ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {formatDisplay(displayValue)}
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
              <Button variant="ghost" size="icon" className="size-6">
                <ImagePlus className="size-3.5 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Calculator Keypad - Refined Design */}
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

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={cn(
                  "relative flex h-12 items-center justify-center gap-2 rounded-xl font-semibold text-white transition-all duration-300",
                  "active:scale-95 disabled:opacity-40 disabled:active:scale-100",
                  canSubmit && "shadow-lg",
                  transactionType === 'expense' && "bg-expense shadow-expense/30 hover:bg-expense/90",
                  transactionType === 'income' && "bg-income shadow-income/30 hover:bg-income/90",
                  transactionType === 'transfer' && "bg-transfer shadow-transfer/30 hover:bg-transfer/90"
                )}
              >
                {canSubmit ? (
                  <>
                    <Check className="size-5" />
                    <span className="text-sm">บันทึก</span>
                  </>
                ) : (
                  <span className="text-sm">บันทึก</span>
                )}

                {/* Sparkle effect when ready */}
                {canSubmit && (
                  <Sparkles className="absolute -right-1 -top-1 size-4 text-white/80 animate-pulse" />
                )}
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

// Calculator Button Component
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
