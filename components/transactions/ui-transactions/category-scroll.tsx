'use client';

import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import type { Category, TransactionType } from '@/types';

interface CategoryScrollProps {
  categories: Category[];
  selectedCategory: Category | null;
  transactionType: TransactionType;
  onSelect: (category: Category) => void;
  onAddNew: () => void;
  label?: string;
}

export function CategoryScroll({
  categories,
  selectedCategory,
  transactionType,
  onSelect,
  onAddNew,
  label = 'เลือกหมวดหมู่',
}: CategoryScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to selected category
  useEffect(() => {
    if (selectedCategory && scrollRef.current) {
      const selectedEl = scrollRef.current.querySelector(
        `[data-category-id="${selectedCategory.id}"]`
      );
      if (selectedEl) {
        selectedEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [selectedCategory]);

  return (
    <div className="border-b border-border/50">
      <div className="mb-2 flex items-center justify-between px-4">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {selectedCategory && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-semibold animate-in slide-in-from-right-2",
              transactionType === 'expense' && "text-expense",
              transactionType === 'income' && "text-income"
            )}
          >
            <Check className="size-3" />
            {selectedCategory.name}
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-4 py-1 scrollbar-hide scroll-smooth"
      >
        {categories.map((category, index) => {
          const isSelected = category.id === selectedCategory?.id;
          return (
            <button
              key={category.id}
              data-category-id={category.id}
              onClick={() => onSelect(category)}
              className={cn(
                "relative px-3 text-sm font-medium rounded-xl transition-all duration-300",
                "hover:bg-accent/50 active:scale-95",
                isSelected &&
                  cn(
                    "ring-2 shadow-lg",
                    transactionType === 'expense' &&
                      "bg-expense/10 ring-expense/50 shadow-expense/20",
                    transactionType === 'income' &&
                      "bg-income/10 ring-income/50 shadow-income/20"
                  )
              )}
              style={{
                animationDelay: `${index * 30}ms`,
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
          onClick={onAddNew}
          className="group flex shrink-0 flex-col items-center gap-1.5 rounded-2xl px-3 py-2.5 transition-all hover:bg-accent/50 active:scale-95"
        >
          <div className="flex size-11 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 transition-colors group-hover:border-primary/50">
            <span className="text-lg text-muted-foreground group-hover:text-primary">
              +
            </span>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
            เพิ่มใหม่
          </span>
        </button>
      </div>
    </div>
  );
}
