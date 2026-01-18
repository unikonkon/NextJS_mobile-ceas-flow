'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategorySelector } from '@/components/categories/category-selector';
import { CalculatorPad } from '@/components/common/calculator-pad';
import { Category, TransactionType } from '@/types';
import { Calendar, Wallet, FileText, ImagePlus, Check } from 'lucide-react';

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
  const [amount, setAmount] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [note, setNote] = useState('');
  const [step, setStep] = useState<'amount' | 'category'>('amount');

  const handleTypeChange = (type: string) => {
    setTransactionType(type as TransactionType);
    setSelectedCategory(null);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleAmountSubmit = () => {
    if (parseFloat(amount) > 0) {
      setStep('category');
    }
  };

  const handleSubmit = () => {
    if (selectedCategory && parseFloat(amount) > 0) {
      onSubmit?.({
        type: transactionType,
        amount: parseFloat(amount),
        categoryId: selectedCategory.id,
        note: note || undefined,
      });

      // Reset form
      setAmount('0');
      setSelectedCategory(null);
      setNote('');
      setStep('amount');
      setOpen(false);
    }
  };

  const handleBack = () => {
    setStep('amount');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl px-0">
        <SheetHeader className="px-4 pb-2">
          <SheetTitle className="text-center">
            {step === 'amount' ? 'เพิ่มรายการ' : 'เลือกหมวดหมู่'}
          </SheetTitle>
        </SheetHeader>

        {/* Transaction Type Tabs */}
        <Tabs
          value={transactionType}
          onValueChange={handleTypeChange}
          className="w-full"
        >
          <TabsList className="mx-4 mb-4 grid w-auto grid-cols-3 bg-muted/50">
            <TabsTrigger
              value="expense"
              className="data-[state=active]:bg-expense/10 data-[state=active]:text-expense"
            >
              💸 รายจ่าย
            </TabsTrigger>
            <TabsTrigger
              value="income"
              className="data-[state=active]:bg-income/10 data-[state=active]:text-income"
            >
              💰 รายรับ
            </TabsTrigger>
            <TabsTrigger
              value="transfer"
              className="data-[state=active]:bg-transfer/10 data-[state=active]:text-transfer"
            >
              🔄 โอนเงิน
            </TabsTrigger>
          </TabsList>

          {/* Content */}
          <div className="px-4">
            {step === 'amount' ? (
              <div className="space-y-4">
                {/* Calculator */}
                <CalculatorPad
                  value={amount}
                  onChange={setAmount}
                  onSubmit={handleAmountSubmit}
                />

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Calendar className="size-4" />
                    วันนี้
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Wallet className="size-4" />
                    เงินสด
                  </Button>
                </div>

                {/* Note Input */}
                <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3">
                  <FileText className="size-4 text-muted-foreground" />
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="เพิ่มบันทึก..."
                    className="border-0 bg-transparent focus-visible:ring-0"
                  />
                  <Button variant="ghost" size="icon-sm">
                    <ImagePlus className="size-4 text-muted-foreground" />
                  </Button>
                </div>

                {/* Submit Button */}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleAmountSubmit}
                  disabled={parseFloat(amount) <= 0}
                >
                  ถัดไป - เลือกหมวดหมู่
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Category Selector */}
                <CategorySelector
                  expenseCategories={expenseCategories}
                  incomeCategories={incomeCategories}
                  selectedId={selectedCategory?.id}
                  defaultType={transactionType === 'income' ? 'income' : 'expense'}
                  onSelect={handleCategorySelect}
                />

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" size="lg" onClick={handleBack} className="flex-1">
                    ย้อนกลับ
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={!selectedCategory}
                    className={cn(
                      'flex-1 gap-2',
                      transactionType === 'expense' && 'bg-expense hover:bg-expense/90',
                      transactionType === 'income' && 'bg-income hover:bg-income/90',
                      transactionType === 'transfer' && 'bg-transfer hover:bg-transfer/90'
                    )}
                  >
                    <Check className="size-5" />
                    บันทึก
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
