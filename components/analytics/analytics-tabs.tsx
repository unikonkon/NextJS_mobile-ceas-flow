'use client';

import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalyticsTabsProps {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const tabs = [
  { value: 'expense', label: 'ค่าใช้จ่าย', icon: '💸' },
  { value: 'income', label: 'รายได้', icon: '💰' },
  { value: 'balance', label: 'งบดุล', icon: '⚖️' },
  { value: 'assets', label: 'สินทรัพย์', icon: '📈' },
  { value: 'liabilities', label: 'หนี้สิน', icon: '📉' },
];

export function AnalyticsTabs({
  defaultValue = 'expense',
  onValueChange,
  children,
  className,
}: AnalyticsTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      className={cn('w-full', className)}
    >
      <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0 scrollbar-hide">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              'flex-shrink-0 gap-1.5 rounded-full px-3 py-1.5',
              'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
              'data-[state=inactive]:bg-muted/50 data-[state=inactive]:text-muted-foreground',
              'transition-all duration-200'
            )}
          >
            <span className="text-sm">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {children}
    </Tabs>
  );
}

// Export individual tab content wrapper
export function AnalyticsTabContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsContent value={value} className={cn('mt-4', className)}>
      {children}
    </TabsContent>
  );
}
