'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const monthNames = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

const fullMonthNames = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

export function MonthPicker({
  value,
  onChange,
  minDate,
  maxDate,
  className,
}: MonthPickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewYear, setViewYear] = useState(value.getFullYear());

  const currentMonth = value.getMonth();
  const currentYear = value.getFullYear();

  const handlePrevMonth = () => {
    const newDate = new Date(value);
    newDate.setMonth(newDate.getMonth() - 1);
    onChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(value);
    newDate.setMonth(newDate.getMonth() + 1);
    onChange(newDate);
  };

  const handleMonthSelect = (month: number) => {
    const newDate = new Date(viewYear, month, 1);
    onChange(newDate);
    setIsExpanded(false);
  };

  const handlePrevYear = () => {
    setViewYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    setViewYear((prev) => prev + 1);
  };

  const isMonthDisabled = (month: number) => {
    const date = new Date(viewYear, month, 1);
    if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), 1)) {
      return true;
    }
    if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)) {
      return true;
    }
    return false;
  };

  return (
    <div className={cn('relative', className)}>
      {/* Compact View */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handlePrevMonth}
          className="rounded-full"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 font-medium transition-colors hover:bg-accent"
        >
          <span>{fullMonthNames[currentMonth]}</span>
          <span className="text-muted-foreground">{currentYear + 543}</span>
        </button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleNextMonth}
          className="rounded-full"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Expanded Month Grid */}
      {isExpanded && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 animate-scale-in rounded-2xl border bg-popover p-4 shadow-lg">
          {/* Year Navigation */}
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handlePrevYear}
              className="rounded-full"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="font-semibold">{viewYear + 543}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleNextYear}
              className="rounded-full"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-3 gap-2">
            {monthNames.map((month, index) => {
              const isSelected = index === currentMonth && viewYear === currentYear;
              const isDisabled = isMonthDisabled(index);

              return (
                <button
                  key={index}
                  onClick={() => !isDisabled && handleMonthSelect(index)}
                  disabled={isDisabled}
                  className={cn(
                    'rounded-lg px-2 py-2 text-sm font-medium transition-all',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent',
                    isDisabled && 'cursor-not-allowed opacity-40'
                  )}
                >
                  {month}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
