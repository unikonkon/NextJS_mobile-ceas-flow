import Dexie, { type EntityTable } from 'dexie';
import type { Transaction, Category, Wallet } from '@/types';

// ============================================
// Database Schema
// ============================================

// Stored transaction (dates as ISO strings for IndexedDB)
export interface StoredTransaction {
  id: string;
  bookId: string;
  walletId: string;
  categoryId: string;
  type: 'expense' | 'income';
  amount: number;
  currency: string;
  date: string; // ISO string
  note?: string;
  imageUrl?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface StoredCategory {
  id: string;
  name: string;
  type: 'expense' | 'income';
}

export interface StoredWallet {
  id: string;
  bookId: string;
  name: string;
  type: 'cash' | 'bank' | 'credit_card' | 'e_wallet' | 'savings';
  icon: string;
  color: string;
  currency: string;
  initialBalance: number;
  currentBalance: number;
  isAsset: boolean;
  createdAt: string; // ISO string
}

// ============================================
// Dexie Database
// ============================================
export class AppDatabase extends Dexie {
  transactions!: EntityTable<StoredTransaction, 'id'>;
  categories!: EntityTable<StoredCategory, 'id'>;
  wallets!: EntityTable<StoredWallet, 'id'>;

  constructor() {
    super('CeasFlowDB');

    this.version(1).stores({
      transactions: 'id, bookId, walletId, categoryId, type, date, createdAt',
      categories: 'id, type',
      wallets: 'id, bookId, type',
    });
  }
}

// Singleton instance
export const db = new AppDatabase();

// ============================================
// Converters: IndexedDB <-> Runtime
// ============================================

export function toStoredTransaction(t: Transaction): StoredTransaction {
  return {
    ...t,
    date: t.date.toISOString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

export function fromStoredTransaction(s: StoredTransaction): Transaction {
  return {
    ...s,
    date: new Date(s.date),
    createdAt: new Date(s.createdAt),
    updatedAt: new Date(s.updatedAt),
  };
}

export function toStoredCategory(c: Category): StoredCategory {
  return {
    id: c.id,
    name: c.name,
    type: c.type,
  };
}

export function fromStoredCategory(s: StoredCategory): Category {
  return {
    id: s.id,
    name: s.name,
    type: s.type,
  };
}

export function toStoredWallet(w: Wallet): StoredWallet {
  return {
    ...w,
    createdAt: w.createdAt.toISOString(),
  };
}

export function fromStoredWallet(s: StoredWallet): Wallet {
  return {
    ...s,
    createdAt: new Date(s.createdAt),
  };
}
