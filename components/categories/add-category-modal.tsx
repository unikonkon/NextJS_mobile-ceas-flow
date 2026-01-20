'use client';

import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryType } from '@/types';
import { Check, X, Tag } from 'lucide-react';

interface AddCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryType: CategoryType;
  onAdd: (name: string, type: CategoryType) => void;
}

export function AddCategoryModal({
  open,
  onOpenChange,
  categoryType,
  onAdd,
}: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<CategoryType>(categoryType);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset and focus when opened
  useEffect(() => {
    if (open) {
      setName('');
      setSelectedType(categoryType);
      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, categoryType]);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (trimmedName) {
      onAdd(trimmedName, selectedType);
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  const canSubmit = name.trim().length > 0;

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="mx-6 w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex size-10 items-center justify-center rounded-xl",
              selectedType === 'expense' ? "bg-expense/10" : "bg-income/10"
            )}>
              <Tag className={cn(
                "size-5",
                selectedType === 'expense' ? "text-expense" : "text-income"
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">เพิ่มหมวดหมู่ใหม่</h3>
              <p className="text-xs text-muted-foreground">สร้างหมวดหมู่สำหรับจัดกลุ่ม</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Type Selector */}
        <div className="mb-4">
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            ประเภท
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType('expense')}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200",
                "border-2",
                selectedType === 'expense'
                  ? "border-expense bg-expense/10 text-expense"
                  : "border-border text-muted-foreground hover:border-expense/50"
              )}
            >
              รายจ่าย
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200",
                "border-2",
                selectedType === 'income'
                  ? "border-income bg-income/10 text-income"
                  : "border-border text-muted-foreground hover:border-income/50"
              )}
            >
              รายรับ
            </button>
          </div>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            ชื่อหมวดหมู่
          </label>
          <div className="relative">
            <Input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="เช่น ค่าเดินทาง, โบนัส..."
              className={cn(
                "h-12 rounded-xl border-2 pl-4 pr-12 text-base transition-all duration-200",
                "focus:ring-0",
                selectedType === 'expense'
                  ? "focus:border-expense"
                  : "focus:border-income"
              )}
              maxLength={30}
            />
            {/* Character Preview */}
            {name && (
              <div className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-lg text-sm font-semibold",
                selectedType === 'expense'
                  ? "bg-expense/10 text-expense"
                  : "bg-income/10 text-income"
              )}>
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground text-right">
            {name.length}/30
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            ยกเลิก
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={cn(
              "flex-1 h-12 rounded-xl font-semibold text-white transition-all",
              selectedType === 'expense'
                ? "bg-expense hover:bg-expense/90 disabled:bg-expense/40"
                : "bg-income hover:bg-income/90 disabled:bg-income/40"
            )}
          >
            <Check className="size-4 mr-2" />
            เพิ่มหมวดหมู่
          </Button>
        </div>
      </div>
    </div>
  );
}
