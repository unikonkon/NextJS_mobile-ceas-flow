import { create } from 'zustand';
import {
  TransactionWithCategory,
  TransactionInput,
  TransactionType,
  DailySummary,
} from '@/types';
import { db, toStoredTransaction, fromStoredTransaction } from './db';
import { useCategoryStore } from './category-store';
import { mockTransactions } from '@/lib/mock/data';

// ============================================
// Helper Functions
// ============================================
function filterTransactionsByMonth(
  transactions: TransactionWithCategory[],
  selectedMonth: Date
): TransactionWithCategory[] {
  const month = selectedMonth.getMonth();
  const year = selectedMonth.getFullYear();
  return transactions.filter((t) => {
    return t.date.getMonth() === month && t.date.getFullYear() === year;
  });
}

function computeDailySummaries(
  transactions: TransactionWithCategory[],
  selectedMonth?: Date
): DailySummary[] {
  // Filter by month if provided
  const filteredTransactions = selectedMonth
    ? filterTransactionsByMonth(transactions, selectedMonth)
    : transactions;

  const grouped = filteredTransactions.reduce((acc, transaction) => {
    const dateKey = transaction.date.toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: transaction.date,
        income: 0,
        expense: 0,
        transactions: [],
      };
    }
    acc[dateKey].transactions.push(transaction);
    if (transaction.type === 'income') {
      acc[dateKey].income += transaction.amount;
    } else if (transaction.type === 'expense') {
      acc[dateKey].expense += transaction.amount;
    }
    return acc;
  }, {} as Record<string, DailySummary>);

  return Object.values(grouped).sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
}

function computeMonthlySummary(
  transactions: TransactionWithCategory[],
  selectedMonth: Date
) {
  const month = selectedMonth.getMonth();
  const year = selectedMonth.getFullYear();

  const monthTransactions = transactions.filter((t) => {
    return t.date.getMonth() === month && t.date.getFullYear() === year;
  });

  const income = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return { income, expense, balance: income - expense };
}

// ============================================
// Store Interface
// ============================================
interface TransactionStore {
  // Data
  transactions: TransactionWithCategory[];
  newTransactionIds: string[];
  isLoading: boolean;
  isInitialized: boolean;

  // Computed (stored to avoid recalculation)
  dailySummaries: DailySummary[];
  monthlySummary: { income: number; expense: number; balance: number };

  // UI State
  selectedMonth: Date;
  toastVisible: boolean;
  toastType: TransactionType;

  // Actions
  loadTransactions: () => Promise<void>;
  addTransaction: (input: TransactionInput) => Promise<void>;
  updateTransaction: (id: string, input: Partial<TransactionInput>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionById: (id: string) => TransactionWithCategory | undefined;
  setSelectedMonth: (date: Date) => void;
  hideToast: () => void;
}

// ============================================
// Create Store
// ============================================
export const useTransactionStore = create<TransactionStore>((set, get) => ({
  // Initial State
  transactions: [],
  newTransactionIds: [],
  isLoading: false,
  isInitialized: false,
  dailySummaries: [],
  monthlySummary: { income: 0, expense: 0, balance: 0 },
  selectedMonth: new Date(),
  toastVisible: false,
  toastType: 'expense',

  // Actions
  loadTransactions: async () => {
    // Prevent multiple loads
    if (get().isLoading || get().isInitialized) return;

    set({ isLoading: true });

    try {
      // Ensure categories are loaded first
      const categoryStore = useCategoryStore.getState();
      if (!categoryStore.isInitialized) {
        await categoryStore.loadCategories();
      }

      // Load from IndexedDB
      const storedTransactions = await db.transactions
        .orderBy('date')
        .reverse()
        .toArray();

      if (storedTransactions.length === 0) {
        // Seed with mock data on first run
        const baseTransactions = mockTransactions.map((t) => ({
          id: t.id,
          bookId: t.bookId,
          walletId: t.walletId,
          categoryId: t.categoryId,
          type: t.type,
          amount: t.amount,
          currency: t.currency,
          date: t.date,
          note: t.note,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        }));

        // Store to IndexedDB
        await db.transactions.bulkPut(
          baseTransactions.map(toStoredTransaction)
        );

        // Build TransactionWithCategory using category store
        const transactionsWithCategory: TransactionWithCategory[] = mockTransactions.map((t) => {
          const category = categoryStore.getCategoryById(t.categoryId);
          return {
            ...t,
            category: category || t.category,
          };
        });

        const selectedMonth = get().selectedMonth;
        set({
          transactions: transactionsWithCategory,
          dailySummaries: computeDailySummaries(transactionsWithCategory, selectedMonth),
          monthlySummary: computeMonthlySummary(transactionsWithCategory, selectedMonth),
          isLoading: false,
          isInitialized: true,
        });
      } else {
        // Convert stored transactions and attach categories
        const transactions = storedTransactions.map((s) => {
          const base = fromStoredTransaction(s);
          const category = categoryStore.getCategoryById(s.categoryId);
          return {
            ...base,
            category: category!,
          } as TransactionWithCategory;
        }).filter((t) => t.category); // Filter out transactions with missing categories

        const selectedMonth = get().selectedMonth;
        set({
          transactions,
          dailySummaries: computeDailySummaries(transactions, selectedMonth),
          monthlySummary: computeMonthlySummary(transactions, selectedMonth),
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  addTransaction: async (input) => {
    const categoryStore = useCategoryStore.getState();
    const category = categoryStore.getCategoryById(input.categoryId);
    if (!category) return;

    const now = input.date ?? new Date();
    const newTransaction: TransactionWithCategory = {
      id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      bookId: 'b1',
      walletId: input.walletId ?? 'w1',
      categoryId: input.categoryId,
      type: input.type,
      amount: input.amount,
      currency: 'THB',
      date: now,
      note: input.note,
      category,
      createdAt: now,
      updatedAt: now,
    };

    // Update Zustand state immediately for fast UI
    const newTransactions = [newTransaction, ...get().transactions];
    const selectedMonth = get().selectedMonth;

    set({
      transactions: newTransactions,
      newTransactionIds: [...get().newTransactionIds, newTransaction.id],
      dailySummaries: computeDailySummaries(newTransactions, selectedMonth),
      monthlySummary: computeMonthlySummary(newTransactions, selectedMonth),
      toastVisible: true,
      toastType: input.type,
    });

    // Persist to IndexedDB (async, non-blocking)
    try {
      await db.transactions.put(
        toStoredTransaction({
          id: newTransaction.id,
          bookId: newTransaction.bookId,
          walletId: newTransaction.walletId,
          categoryId: newTransaction.categoryId,
          type: newTransaction.type,
          amount: newTransaction.amount,
          currency: newTransaction.currency,
          date: newTransaction.date,
          note: newTransaction.note,
          createdAt: newTransaction.createdAt,
          updatedAt: newTransaction.updatedAt,
        })
      );
    } catch (error) {
      console.error('Failed to persist transaction:', error);
    }

    // Auto hide toast
    setTimeout(() => {
      set({ toastVisible: false });
    }, 2500);

    // Remove new flag
    setTimeout(() => {
      set((state) => ({
        newTransactionIds: state.newTransactionIds.filter(
          (id) => id !== newTransaction.id
        ),
      }));
    }, 3000);
  },

  updateTransaction: async (id, input) => {
    const categoryStore = useCategoryStore.getState();
    const existingTransaction = get().transactions.find((t) => t.id === id);
    if (!existingTransaction) return;

    // Get new category if changed
    const category = input.categoryId
      ? categoryStore.getCategoryById(input.categoryId)
      : existingTransaction.category;
    if (!category) return;

    const now = new Date();
    const updatedTransaction: TransactionWithCategory = {
      ...existingTransaction,
      type: input.type ?? existingTransaction.type,
      amount: input.amount ?? existingTransaction.amount,
      categoryId: input.categoryId ?? existingTransaction.categoryId,
      date: input.date ?? existingTransaction.date,
      note: input.note !== undefined ? input.note : existingTransaction.note,
      category,
      updatedAt: now,
    };

    // Update Zustand state immediately
    const transactions = get().transactions.map((t) =>
      t.id === id ? updatedTransaction : t
    );
    const selectedMonth = get().selectedMonth;

    set({
      transactions,
      dailySummaries: computeDailySummaries(transactions, selectedMonth),
      monthlySummary: computeMonthlySummary(transactions, selectedMonth),
      toastVisible: true,
      toastType: updatedTransaction.type,
    });

    // Persist to IndexedDB
    try {
      await db.transactions.put(
        toStoredTransaction({
          id: updatedTransaction.id,
          bookId: updatedTransaction.bookId,
          walletId: updatedTransaction.walletId,
          categoryId: updatedTransaction.categoryId,
          type: updatedTransaction.type,
          amount: updatedTransaction.amount,
          currency: updatedTransaction.currency,
          date: updatedTransaction.date,
          note: updatedTransaction.note,
          createdAt: updatedTransaction.createdAt,
          updatedAt: updatedTransaction.updatedAt,
        })
      );
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }

    // Auto hide toast
    setTimeout(() => {
      set({ toastVisible: false });
    }, 2500);
  },

  deleteTransaction: async (id: string) => {
    const transactions = get().transactions.filter((t) => t.id !== id);
    const selectedMonth = get().selectedMonth;

    // Update Zustand state immediately
    set({
      transactions,
      dailySummaries: computeDailySummaries(transactions, selectedMonth),
      monthlySummary: computeMonthlySummary(transactions, selectedMonth),
    });

    // Delete from IndexedDB
    try {
      await db.transactions.delete(id);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  },

  getTransactionById: (id: string) => {
    return get().transactions.find((t) => t.id === id);
  },

  setSelectedMonth: (date) => {
    const transactions = get().transactions;
    set({
      selectedMonth: date,
      dailySummaries: computeDailySummaries(transactions, date),
      monthlySummary: computeMonthlySummary(transactions, date),
    });
  },

  hideToast: () => {
    set({ toastVisible: false });
  },
}));
