import {
  Category,
  Wallet,
  TransactionWithCategory,
  DailySummary,
  CategorySummary,
} from '@/types';

// Mock Categories
export const mockExpenseCategories: Category[] = [
  { id: '1', name: 'อาหาร', type: 'expense', icon: '🍔', color: 'category-food', sortOrder: 1, isSystem: true, createdAt: new Date() },
  { id: '2', name: 'ของใช้', type: 'expense', icon: '🛒', color: 'category-shopping', sortOrder: 2, isSystem: true, createdAt: new Date() },
  { id: '3', name: 'การจราจร', type: 'expense', icon: '🚌', color: 'category-transport', sortOrder: 3, isSystem: true, createdAt: new Date() },
  { id: '4', name: 'เดท', type: 'expense', icon: '🍽️', color: 'category-social', sortOrder: 4, isSystem: true, createdAt: new Date() },
  { id: '5', name: 'ทางการแพทย์', type: 'expense', icon: '🏥', color: 'category-health', sortOrder: 5, isSystem: true, createdAt: new Date() },
  { id: '6', name: 'ครอบครัว', type: 'expense', icon: '👨‍👩‍👧', color: 'category-family', sortOrder: 6, isSystem: true, createdAt: new Date() },
  { id: '7', name: 'นันทนาการ', type: 'expense', icon: '🎬', color: 'category-entertainment', sortOrder: 7, isSystem: true, createdAt: new Date() },
  { id: '8', name: 'ทางสังคม', type: 'expense', icon: '🥂', color: 'category-social', sortOrder: 8, isSystem: true, createdAt: new Date() },
  { id: '9', name: 'ที่อยู่อาศัย', type: 'expense', icon: '🏠', color: 'category-housing', sortOrder: 9, isSystem: true, createdAt: new Date() },
  { id: '10', name: 'สื่อสาร', type: 'expense', icon: '📱', color: 'category-communication', sortOrder: 10, isSystem: true, createdAt: new Date() },
  { id: '11', name: 'เสื้อผ้า', type: 'expense', icon: '👕', color: 'category-clothing', sortOrder: 11, isSystem: true, createdAt: new Date() },
  { id: '12', name: 'อื่นๆ', type: 'expense', icon: '📦', color: 'category-other', sortOrder: 12, isSystem: true, createdAt: new Date() },
];

export const mockIncomeCategories: Category[] = [
  { id: '101', name: 'เงินเดือน', type: 'income', icon: '💵', color: 'category-family', sortOrder: 1, isSystem: true, createdAt: new Date() },
  { id: '102', name: 'โบนัส', type: 'income', icon: '🎁', color: 'category-entertainment', sortOrder: 2, isSystem: true, createdAt: new Date() },
  { id: '103', name: 'ค่าคอมมิชชั่น', type: 'income', icon: '💰', color: 'category-shopping', sortOrder: 3, isSystem: true, createdAt: new Date() },
  { id: '104', name: 'ดอกเบี้ย', type: 'income', icon: '🏦', color: 'category-bills', sortOrder: 4, isSystem: true, createdAt: new Date() },
  { id: '105', name: 'รายได้เสริม', type: 'income', icon: '✨', color: 'category-health', sortOrder: 5, isSystem: true, createdAt: new Date() },
  { id: '106', name: 'อื่นๆ', type: 'income', icon: '📥', color: 'category-other', sortOrder: 6, isSystem: true, createdAt: new Date() },
];

// Mock Wallets
export const mockWallets: Wallet[] = [
  {
    id: 'w1',
    bookId: 'b1',
    name: 'เงินสด',
    type: 'cash',
    icon: '💵',
    color: 'green',
    currency: 'THB',
    initialBalance: 5000,
    currentBalance: 12450,
    isAsset: true,
    createdAt: new Date(),
  },
  {
    id: 'w2',
    bookId: 'b1',
    name: 'ธ.กสิกรไทย',
    type: 'bank',
    icon: '🏦',
    color: 'green',
    currency: 'THB',
    initialBalance: 50000,
    currentBalance: 145680,
    isAsset: true,
    createdAt: new Date(),
  },
  {
    id: 'w3',
    bookId: 'b1',
    name: 'PromptPay',
    type: 'e_wallet',
    icon: '📱',
    color: 'blue',
    currency: 'THB',
    initialBalance: 0,
    currentBalance: 3200,
    isAsset: true,
    createdAt: new Date(),
  },
  {
    id: 'w4',
    bookId: 'b1',
    name: 'บัตรเครดิต KBank',
    type: 'credit_card',
    icon: '💳',
    color: 'purple',
    currency: 'THB',
    initialBalance: 0,
    currentBalance: -15420,
    isAsset: false,
    createdAt: new Date(),
  },
];

// Helper to create dates
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

// Mock Transactions
export const mockTransactions: TransactionWithCategory[] = [
  // Today
  {
    id: 't1',
    bookId: 'b1',
    walletId: 'w1',
    categoryId: '1',
    type: 'expense',
    amount: 120,
    currency: 'THB',
    date: today,
    note: 'มื้อเที่ยง',
    category: mockExpenseCategories[0],
    wallet: mockWallets[0],
    createdAt: today,
    updatedAt: today,
  },
  {
    id: 't2',
    bookId: 'b1',
    walletId: 'w2',
    categoryId: '3',
    type: 'expense',
    amount: 45,
    currency: 'THB',
    date: today,
    note: 'BTS',
    category: mockExpenseCategories[2],
    wallet: mockWallets[1],
    createdAt: today,
    updatedAt: today,
  },
  {
    id: 't3',
    bookId: 'b1',
    walletId: 'w3',
    categoryId: '2',
    type: 'expense',
    amount: 299,
    currency: 'THB',
    date: today,
    note: '7-Eleven',
    category: mockExpenseCategories[1],
    wallet: mockWallets[2],
    createdAt: today,
    updatedAt: today,
  },
  // Yesterday
  {
    id: 't4',
    bookId: 'b1',
    walletId: 'w1',
    categoryId: '1',
    type: 'expense',
    amount: 250,
    currency: 'THB',
    date: yesterday,
    note: 'อาหารเย็นกับเพื่อน',
    category: mockExpenseCategories[0],
    wallet: mockWallets[0],
    createdAt: yesterday,
    updatedAt: yesterday,
  },
  {
    id: 't5',
    bookId: 'b1',
    walletId: 'w2',
    categoryId: '101',
    type: 'income',
    amount: 45000,
    currency: 'THB',
    date: yesterday,
    note: 'เงินเดือนเดือน ม.ค.',
    category: mockIncomeCategories[0],
    wallet: mockWallets[1],
    createdAt: yesterday,
    updatedAt: yesterday,
  },
  {
    id: 't6',
    bookId: 'b1',
    walletId: 'w4',
    categoryId: '7',
    type: 'expense',
    amount: 590,
    currency: 'THB',
    date: yesterday,
    note: 'Netflix & Spotify',
    category: mockExpenseCategories[6],
    wallet: mockWallets[3],
    createdAt: yesterday,
    updatedAt: yesterday,
  },
  // Two days ago
  {
    id: 't7',
    bookId: 'b1',
    walletId: 'w1',
    categoryId: '5',
    type: 'expense',
    amount: 850,
    currency: 'THB',
    date: twoDaysAgo,
    note: 'ค่ายา',
    category: mockExpenseCategories[4],
    wallet: mockWallets[0],
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },
  {
    id: 't8',
    bookId: 'b1',
    walletId: 'w2',
    categoryId: '9',
    type: 'expense',
    amount: 8500,
    currency: 'THB',
    date: twoDaysAgo,
    note: 'ค่าเช่าห้อง',
    category: mockExpenseCategories[8],
    wallet: mockWallets[1],
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },
];

// Group transactions by day
export const mockDailySummaries: DailySummary[] = [
  {
    date: today,
    income: 0,
    expense: 464,
    transactions: mockTransactions.filter((t) => t.date.toDateString() === today.toDateString()),
  },
  {
    date: yesterday,
    income: 45000,
    expense: 840,
    transactions: mockTransactions.filter((t) => t.date.toDateString() === yesterday.toDateString()),
  },
  {
    date: twoDaysAgo,
    income: 0,
    expense: 9350,
    transactions: mockTransactions.filter((t) => t.date.toDateString() === twoDaysAgo.toDateString()),
  },
];

// Mock Category Summaries for Analytics
export const mockExpenseSummaries: CategorySummary[] = [
  { category: mockExpenseCategories[8], amount: 8500, percentage: 45.2, transactionCount: 1 },
  { category: mockExpenseCategories[0], amount: 370, percentage: 19.7, transactionCount: 2 },
  { category: mockExpenseCategories[4], amount: 850, percentage: 15.3, transactionCount: 1 },
  { category: mockExpenseCategories[6], amount: 590, percentage: 10.6, transactionCount: 1 },
  { category: mockExpenseCategories[1], amount: 299, percentage: 5.4, transactionCount: 1 },
  { category: mockExpenseCategories[2], amount: 45, percentage: 3.8, transactionCount: 1 },
];

export const mockIncomeSummaries: CategorySummary[] = [
  { category: mockIncomeCategories[0], amount: 45000, percentage: 100, transactionCount: 1 },
];

// Monthly Summary
export const mockMonthlySummary = {
  income: 45000,
  expense: 10654,
  balance: 34346,
};

// Wallet Summary
export const mockWalletSummary = {
  netWorth: 145910,
  totalAssets: 161330,
  totalLiabilities: 15420,
};
