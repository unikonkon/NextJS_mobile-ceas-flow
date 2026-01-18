// Transaction Types
export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Transaction {
  id: string;
  bookId: string;
  walletId: string;
  categoryId: string;
  toWalletId?: string; // For transfers
  type: TransactionType;
  amount: number;
  currency: string;
  date: Date;
  note?: string;
  imageUrl?: string;
  memberId?: string;
  recurringId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionWithCategory extends Transaction {
  category: Category;
  wallet?: Wallet;
  toWallet?: Wallet;
}

// Category Types
export type CategoryType = 'expense' | 'income';

export interface Category {
  id: string;
  bookId?: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  parentId?: string;
  sortOrder: number;
  isSystem: boolean;
  createdAt: Date;
}

// Wallet Types
export type WalletType = 'cash' | 'bank' | 'credit_card' | 'e_wallet' | 'savings';

export interface Wallet {
  id: string;
  bookId: string;
  name: string;
  type: WalletType;
  icon: string;
  color: string;
  currency: string;
  initialBalance: number;
  currentBalance: number;
  isAsset: boolean;
  createdAt: Date;
}

// Book Types
export interface Book {
  id: string;
  userId: string;
  name: string;
  icon: string;
  currency: string;
  isDefault: boolean;
  createdAt: Date;
}

// Budget Types
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export interface Budget {
  id: string;
  bookId: string;
  categoryId?: string;
  amount: number;
  spent: number;
  period: BudgetPeriod;
  startDate: Date;
  alertPercentage: number;
  createdAt: Date;
}

// Goal Types
export interface Goal {
  id: string;
  bookId: string;
  name: string;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  createdAt: Date;
}

// Recurring Transaction Types
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  bookId: string;
  walletId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  frequency: RecurringFrequency;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate: Date;
  endDate?: Date;
  nextDate: Date;
  note?: string;
  isActive: boolean;
  createdAt: Date;
}

// Member Types
export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Member {
  id: string;
  bookId: string;
  userId?: string;
  name: string;
  role: MemberRole;
  avatarUrl?: string;
  createdAt: Date;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface CategorySummary {
  category: Category;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface DailySummary {
  date: Date;
  income: number;
  expense: number;
  transactions: TransactionWithCategory[];
}

export interface MonthlySummary {
  month: Date;
  income: number;
  expense: number;
  balance: number;
}

// UI Types
export interface MonthYear {
  month: number;
  year: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}
