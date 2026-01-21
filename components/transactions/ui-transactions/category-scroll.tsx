'use client';

import { cn } from '@/lib/utils';
import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Check,
  Settings2,
  GripVertical,
  Eye,
  EyeOff,
  Plus,
  X,
  Sparkles,
  Tag,
} from 'lucide-react';
import type { Category, TransactionType, CategoryType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CategoryScrollProps {
  categories: Category[];
  selectedCategory: Category | null;
  transactionType: TransactionType;
  onSelect: (category: Category) => void;
  onAddNew: () => void;
  onReorderCategories?: (categories: Category[]) => void;
  onAddCategory?: (name: string, type: CategoryType) => void;
  label?: string;
}

const VISIBLE_COUNT_KEY = 'category-visible-count';

export function CategoryScroll({
  categories,
  selectedCategory,
  transactionType,
  onSelect,
  onAddNew,
  onReorderCategories,
  onAddCategory,
  label = 'เลือกหมวดหมู่',
}: CategoryScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Settings modal state
  const [showSettings, setShowSettings] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [orderedCategories, setOrderedCategories] = useState<Category[]>(categories);
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [localVisibleCount, setLocalVisibleCount] = useState(8);
  const [hasChanges, setHasChanges] = useState(false);

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Add category form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Load visible count from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`${VISIBLE_COUNT_KEY}-${transactionType}`);
    if (stored) {
      const count = parseInt(stored, 10);
      setVisibleCount(count);
      setLocalVisibleCount(count);
    }
  }, [transactionType]);

  // Sync ordered categories when categories prop changes
  useEffect(() => {
    setOrderedCategories(categories);
    setLocalCategories(categories);
  }, [categories]);

  // Reset modal state when opened
  useEffect(() => {
    if (showSettings) {
      setLocalCategories([...orderedCategories]);
      setLocalVisibleCount(visibleCount);
      setHasChanges(false);
      setShowAddForm(false);
      setNewCategoryName('');
    }
  }, [showSettings, orderedCategories, visibleCount]);

  // Focus input when add form opens
  useEffect(() => {
    if (showAddForm && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showAddForm]);

  // Drag handlers
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedIndex !== null && draggedIndex !== index) {
        setDragOverIndex(index);
      }
    },
    [draggedIndex]
  );

  const handleDragEnd = useCallback(() => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newCategories = [...localCategories];
      const [removed] = newCategories.splice(draggedIndex, 1);
      newCategories.splice(dragOverIndex, 0, removed);
      setLocalCategories(newCategories);
      setHasChanges(true);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, dragOverIndex, localCategories]);

  const handleVisibleCountChange = useCallback((count: number) => {
    setLocalVisibleCount(count);
    setHasChanges(true);
  }, []);

  const handleAddCategory = useCallback(() => {
    const trimmedName = newCategoryName.trim();
    if (trimmedName && onAddCategory) {
      onAddCategory(trimmedName, transactionType as CategoryType);
      setNewCategoryName('');
      setShowAddForm(false);
    }
  }, [newCategoryName, onAddCategory, transactionType]);

  const handleSave = useCallback(() => {
    setOrderedCategories(localCategories);
    setVisibleCount(localVisibleCount);
    localStorage.setItem(`${VISIBLE_COUNT_KEY}-${transactionType}`, localVisibleCount.toString());

    if (onReorderCategories) {
      onReorderCategories(localCategories);
    }
    setShowSettings(false);
  }, [localCategories, localVisibleCount, transactionType, onReorderCategories]);

  // Get visible categories for display
  const displayCategories = orderedCategories.slice(0, visibleCount);

  // Visible count options
  const visibleCountOptions = [8, 10, 12, 14, 16, 18];
  const uniqueOptions = [...new Set([...visibleCountOptions, localCategories.length])].filter(
    (n) => n <= localCategories.length
  );

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
    <div className="relative border-b border-border/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>

        <div className="flex items-center gap-2">

          {/* Selected Category Badge */}
          {selectedCategory && (
            <span
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs',
                'animate-in slide-in-from-right-2 duration-300',
                'shadow-sm',
                transactionType === 'expense' && 'text-expense bg-expense/10',
                transactionType === 'income' && 'text-income bg-income/10'
              )}
            >
              <Check className="size-3" />
              {selectedCategory.name}
            </span>
          )}

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className={cn(
              'group flex items-center gap-1.5 pl-2.5 py-1.5 rounded-xl',
              'text-xs font-medium transition-all duration-300',
              'border border-transparent',
              'hover:scale-105 active:scale-95',
              transactionType === 'expense'
                ? 'text-expense/70 hover:text-expense hover:bg-expense/10 hover:border-expense/30'
                : 'text-income/70 hover:text-income hover:bg-income/10 hover:border-income/30'
            )}
          >
            <Settings2 className="size-3.5 transition-transform duration-300 group-hover:rotate-90" />
            <span className="font-semibold">ตั้งค่า</span>
          </button>

        </div>
      </div>

      {/* Category Grid - 2 Rows with Scroll */}
      <div
        ref={scrollRef}
        className={cn(
          'relative px-4 py-1.5 overflow-x-auto scrollbar-hide scroll-smooth',
          'h-[160px] overflow-y-hidden'
        )}
      >
        <div className="grid grid-flow-col auto-cols-max grid-rows-2 gap-2">
          {displayCategories.map((category, index) => {
            const isSelected = category.id === selectedCategory?.id;
            return (
              <button
                key={category.id}
                data-category-id={category.id}
                onClick={() => onSelect(category)}
                className={cn(
                  'group relative flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl',
                  'transition-all duration-300 min-w-[60px]',
                  'hover:bg-accent/50 active:scale-95',
                  isSelected &&
                  cn(
                    'ring-2 shadow-lg',
                    transactionType === 'expense' &&
                    'bg-expense/10 ring-expense/50 shadow-expense/20',
                    transactionType === 'income' &&
                    'bg-income/10 ring-income/50 shadow-income/20'
                  )
                )}
                style={{
                  animationDelay: `${index * 20}ms`,
                }}
              >
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-xl text-base font-semibold',
                    'transition-all duration-200',
                    'bg-muted/50',
                    isSelected && cn(
                      'scale-105 shadow-md',
                      transactionType === 'expense' && 'bg-expense/20 text-expense',
                      transactionType === 'income' && 'bg-income/20 text-income'
                    ),
                    !isSelected && 'group-hover:bg-muted'
                  )}
                >
                  {category.name.charAt(0)}
                </div>
                <span
                  className={cn(
                    'text-[9px] font-medium text-muted-foreground whitespace-nowrap max-w-[56px] truncate',
                    isSelected && 'text-foreground font-semibold'
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
            className={cn(
              'group flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl min-w-[60px]',
              'transition-all duration-200 hover:bg-accent/30 active:scale-95'
            )}
          >
            <div
              className={cn(
                'flex size-10 items-center justify-center rounded-xl',
                'border-2 border-dashed border-muted-foreground/30',
                'transition-all duration-200',
                'group-hover:border-primary/50 group-hover:bg-primary/5'
              )}
            >
              <Plus className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-[9px] font-medium text-muted-foreground whitespace-nowrap group-hover:text-primary">
              เพิ่มใหม่
            </span>
          </button>
        </div>
      </div>

      {/* Settings Modal - Inline like showDeleteConfirm */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowSettings(false)}
        >
          <div
            className={cn(
              'relative w-full max-w-md overflow-hidden',
              'bg-card rounded-t-[2rem] sm:rounded-[2rem]',
              'shadow-2xl animate-in slide-in-from-bottom-8 duration-300',
              'max-h-[85vh] flex flex-col'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-24 overflow-hidden pointer-events-none">
              <div
                className={cn(
                  'absolute -top-12 -left-12 w-40 h-40 rounded-full blur-3xl opacity-20',
                  transactionType === 'expense' ? 'bg-expense' : 'bg-income'
                )}
              />
              <div
                className={cn(
                  'absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-15',
                  transactionType === 'expense' ? 'bg-expense' : 'bg-income'
                )}
              />
            </div>

            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-border" />
            </div>

            {/* Modal Header */}
            <div className="relative px-5 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex size-11 items-center justify-center rounded-2xl shadow-lg',
                      transactionType === 'expense'
                        ? 'bg-expense/15 shadow-expense/20'
                        : 'bg-income/15 shadow-income/20'
                    )}
                  >
                    <Settings2
                      className={cn(
                        'size-5',
                        transactionType === 'expense' ? 'text-expense' : 'text-income'
                      )}
                    />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">ตั้งค่าหมวดหมู่</h2>
                    <p className="text-[11px] text-muted-foreground">
                      {transactionType === 'expense' ? 'รายจ่าย' : 'รายรับ'} •{' '}
                      {localCategories.length} หมวดหมู่
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="size-5" />
                </Button>
              </div>
            </div>

            {/* Visible Count Selector */}
            <div className="px-5 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">จำนวนที่แสดง</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {uniqueOptions.map((count) => (
                  <button
                    key={count}
                    onClick={() => handleVisibleCountChange(count)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                      'border-2',
                      localVisibleCount === count
                        ? cn(
                          'scale-105 shadow-md',
                          transactionType === 'expense'
                            ? 'border-expense bg-expense/15 text-expense shadow-expense/20'
                            : 'border-income bg-income/15 text-income shadow-income/20'
                        )
                        : 'border-border bg-muted/30 text-muted-foreground hover:border-foreground/30'
                    )}
                  >
                    {count === localCategories.length ? 'ทั้งหมด' : count}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="px-5 pb-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                  <GripVertical className="size-2.5" />
                  ลากเพื่อจัดลำดับ
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </div>

            {/* Category List */}
            <div className="flex-1 overflow-y-auto px-3 pb-2 min-h-0 max-h-[35vh]">
              <div className="space-y-1.5">
                {localCategories.map((category, index) => {
                  const isVisible = index < localVisibleCount;
                  const isDragging = draggedIndex === index;
                  const isDragOver = dragOverIndex === index;

                  return (
                    <div
                      key={category.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        'group relative flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl',
                        'border-2 transition-all duration-200 cursor-grab active:cursor-grabbing',
                        'hover:shadow-sm',
                        isDragging && 'opacity-50 scale-95 shadow-lg',
                        isDragOver &&
                        cn(
                          'border-dashed',
                          transactionType === 'expense' ? 'border-expense' : 'border-income'
                        ),
                        !isDragging &&
                        !isDragOver &&
                        (isVisible
                          ? 'border-border/50 bg-card hover:border-foreground/20'
                          : 'border-transparent bg-muted/30 opacity-60')
                      )}
                    >
                      {/* Drag Handle */}
                      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-muted/50 group-hover:bg-muted">
                        <GripVertical className="size-3.5 text-muted-foreground" />
                      </div>

                      {/* Category Icon */}
                      <div
                        className={cn(
                          'flex size-9 items-center justify-center rounded-lg text-sm font-bold',
                          isVisible
                            ? cn(
                              'shadow-sm',
                              transactionType === 'expense'
                                ? 'bg-expense/15 text-expense'
                                : 'bg-income/15 text-income'
                            )
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {category.name.charAt(0)}
                      </div>

                      {/* Category Name */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium truncate',
                            isVisible ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {category.name}
                        </p>
                        <p className="text-[9px] text-muted-foreground">#{index + 1}</p>
                      </div>

                      {/* Visibility Badge */}
                      <div
                        className={cn(
                          'flex items-center justify-center size-6 rounded-full',
                          isVisible
                            ? cn(
                              transactionType === 'expense'
                                ? 'bg-expense/15 text-expense'
                                : 'bg-income/15 text-income'
                            )
                            : 'bg-muted/50 text-muted-foreground'
                        )}
                      >
                        {isVisible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Category Section */}
            <div className="px-3 py-2.5 border-t border-border/50 bg-muted/10">
              {showAddForm ? (
                <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-center gap-1.5">
                    <Tag
                      className={cn(
                        'size-3.5',
                        transactionType === 'expense' ? 'text-expense' : 'text-income'
                      )}
                    />
                    <span className="text-xs font-medium">เพิ่มหมวดหมู่ใหม่</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        ref={inputRef}
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newCategoryName.trim()) {
                            handleAddCategory();
                          }
                          if (e.key === 'Escape') {
                            setShowAddForm(false);
                            setNewCategoryName('');
                          }
                        }}
                        placeholder="ชื่อหมวดหมู่..."
                        className={cn(
                          'h-10 rounded-xl border-2 pl-3 pr-10 text-sm',
                          transactionType === 'expense'
                            ? 'focus:border-expense'
                            : 'focus:border-income'
                        )}
                        maxLength={30}
                      />
                      {newCategoryName && (
                        <div
                          className={cn(
                            'absolute right-2.5 top-1/2 -translate-y-1/2',
                            'flex size-6 items-center justify-center rounded-md',
                            'text-[10px] font-bold',
                            transactionType === 'expense'
                              ? 'bg-expense/15 text-expense'
                              : 'bg-income/15 text-income'
                          )}
                        >
                          {newCategoryName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewCategoryName('');
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                    <Button
                      disabled={!newCategoryName.trim()}
                      onClick={handleAddCategory}
                      className={cn(
                        'h-10 w-10 rounded-xl text-white',
                        transactionType === 'expense'
                          ? 'bg-expense hover:bg-expense/90 disabled:bg-expense/40'
                          : 'bg-income hover:bg-income/90 disabled:bg-income/40'
                      )}
                    >
                      <Check className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className={cn(
                    'w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl',
                    'border-2 border-dashed transition-all duration-200',
                    'text-xs font-medium',
                    'hover:scale-[1.01] active:scale-[0.99]',
                    transactionType === 'expense'
                      ? 'border-expense/30 text-expense hover:border-expense hover:bg-expense/5'
                      : 'border-income/30 text-income hover:border-income hover:bg-income/5'
                  )}
                >
                  <Plus className="size-3.5" />
                  เพิ่มหมวดหมู่ใหม่
                </button>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-3 pb-5 pt-2 flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-xl border-2 font-semibold"
                onClick={() => setShowSettings(false)}
              >
                ยกเลิก
              </Button>
              <Button
                disabled={!hasChanges}
                onClick={handleSave}
                className={cn(
                  'flex-1 h-11 rounded-xl font-semibold text-white',
                  'transition-all duration-200 disabled:opacity-50',
                  hasChanges && 'shadow-lg',
                  transactionType === 'expense'
                    ? cn('bg-expense hover:bg-expense/90', hasChanges && 'shadow-expense/30')
                    : cn('bg-income hover:bg-income/90', hasChanges && 'shadow-income/30')
                )}
              >
                <Sparkles className="size-3.5 mr-1.5" />
                บันทึก
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
