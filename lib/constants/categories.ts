import { Category, CategoryType } from '@/types';

// ============================================
// Category Constants with Icon & Color
// ============================================

export const expenseCategories: Category[] = [
  // 🍽️ อาหารและเครื่องดื่ม
  { id: "1", name: "อาหาร", icon: "🍜", type: "expense", color: "#ef4444" },
  { id: "2", name: "เครื่องดื่ม/กาแฟ", icon: "☕", type: "expense", color: "#f97316" },
  
  // 🚗 การเดินทาง
  { id: "3", name: "เดินทาง", icon: "🚗", type: "expense", color: "#3b82f6" },
  { id: "4", name: "น้ำมัน", icon: "⛽", type: "expense", color: "#6366f1" },
  { id: "5", name: "ขนส่งสาธารณะ", icon: "🚇", type: "expense", color: "#8b5cf6" },
  
  // 🏠 ที่อยู่อาศัย
  { id: "6", name: "ค่าเช่า/ผ่อนบ้าน", icon: "🏠", type: "expense", color: "#ec4899" },
  { id: "7", name: "ค่าไฟ", icon: "💡", type: "expense", color: "#f59e0b" },
  { id: "8", name: "ค่าน้ำ", icon: "💧", type: "expense", color: "#06b6d4" },
  { id: "9", name: "ค่าอินเทอร์เน็ต", icon: "📶", type: "expense", color: "#10b981" },
  
  // 📱 สื่อสาร
  { id: "10", name: "โทรศัพท์", icon: "📱", type: "expense", color: "#14b8a6" },
  
  // 🛒 ช้อปปิ้ง
  { id: "11", name: "ของใช้ส่วนตัว", icon: "🧴", type: "expense", color: "#f472b6" },
  { id: "12", name: "เสื้อผ้า", icon: "👕", type: "expense", color: "#a855f7" },
  { id: "13", name: "ช้อปปิ้ง", icon: "🛍️", type: "expense", color: "#d946ef" },
  
  // 💊 สุขภาพ
  { id: "14", name: "สุขภาพ/ยา", icon: "💊", type: "expense", color: "#22c55e" },
  { id: "15", name: "ออกกำลังกาย", icon: "🏋️", type: "expense", color: "#84cc16" },
  
  // 🎬 ความบันเทิง
  { id: "16", name: "บันเทิง", icon: "🎬", type: "expense", color: "#f43f5e" },
  { id: "17", name: "เกม", icon: "🎮", type: "expense", color: "#7c3aed" },
  { id: "18", name: "Subscription", icon: "📺", type: "expense", color: "#e11d48" },
  
  // 👨‍👩‍👧 ครอบครัวและสังคม
  { id: "19", name: "ครอบครัว", icon: "👨‍👩‍👧", type: "expense", color: "#0ea5e9" },
  { id: "20", name: "เดท", icon: "💑", type: "expense", color: "#fb7185" },
  { id: "21", name: "สังสรรค์", icon: "🍻", type: "expense", color: "#fbbf24" },
  { id: "22", name: "ของขวัญ", icon: "🎁", type: "expense", color: "#c084fc" },
  
  // 📚 การศึกษาและพัฒนาตัวเอง
  { id: "23", name: "การศึกษา", icon: "📚", type: "expense", color: "#2563eb" },
  { id: "24", name: "หนังสือ", icon: "📖", type: "expense", color: "#7c3aed" },
  
  // ✈️ ท่องเที่ยว
  { id: "25", name: "ท่องเที่ยว", icon: "✈️", type: "expense", color: "#0891b2" },
  
  // 💰 การเงิน
  { id: "26", name: "ประกัน", icon: "🛡️", type: "expense", color: "#059669" },
  { id: "27", name: "ผ่อนชำระ", icon: "💳", type: "expense", color: "#dc2626" },
  { id: "28", name: "ภาษี", icon: "🏛️", type: "expense", color: "#78716c" },
  
  // 🐱 สัตว์เลี้ยง
  { id: "29", name: "สัตว์เลี้ยง", icon: "🐱", type: "expense", color: "#fb923c" },
  
  // ➕ อื่นๆ
  { id: "30", name: "อื่นๆ", icon: "📦", type: "expense", color: "#64748b" },
];

export const incomeCategories: Category[] = [
  // 💰 รายได้หลัก
  { id: "101", name: "เงินเดือน", icon: "💰", type: "income", color: "#22c55e" },
  { id: "102", name: "โบนัส", icon: "🎉", type: "income", color: "#eab308" },
  { id: "103", name: "ค่าล่วงเวลา (OT)", icon: "⏰", type: "income", color: "#f97316" },
  { id: "104", name: "ค่าคอมมิชชั่น", icon: "📈", type: "income", color: "#3b82f6" },
  
  // 💵 รายได้เสริม
  { id: "105", name: "รายได้เสริม", icon: "💵", type: "income", color: "#10b981" },
  { id: "106", name: "ฟรีแลนซ์", icon: "💻", type: "income", color: "#8b5cf6" },
  { id: "107", name: "ขายของ", icon: "🏪", type: "income", color: "#ec4899" },
  
  // 📊 รายได้จากการลงทุน
  { id: "108", name: "เงินปันผล", icon: "📊", type: "income", color: "#06b6d4" },
  { id: "109", name: "ดอกเบี้ย", icon: "🏦", type: "income", color: "#14b8a6" },
  { id: "110", name: "กำไรจากการลงทุน", icon: "📈", type: "income", color: "#84cc16" },
  
  // 🎁 รายได้พิเศษ
  { id: "111", name: "เงินคืนภาษี", icon: "🏛️", type: "income", color: "#a855f7" },
  { id: "112", name: "ได้รับเงิน/ของขวัญ", icon: "🎁", type: "income", color: "#f43f5e" },
  { id: "113", name: "รางวัล", icon: "🏆", type: "income", color: "#fbbf24" },
  
  // ➕ อื่นๆ
  { id: "114", name: "อื่นๆ", icon: "📥", type: "income", color: "#64748b" },
];

// ============================================
// Grouped Icon Categories for Icon Picker
// ============================================
export interface IconGroup {
  id: string;
  name: string;
  emoji: string;
  color: string;
  icons: string[];
}

export const iconGroups: IconGroup[] = [
  {
    id: 'food',
    name: 'อาหาร',
    emoji: '🍽️',
    color: '#ef4444',
    icons: ['🍕', '🍔', '🍱', '🍣', '🍰', '🍦', '🧋', '🥤', '🍺', '🍷', '🍝', '🍛', '🍲', '🥗', '🌮', '🥐', '🧁', '🍩', '🥡', '🫖'],
  },
  {
    id: 'transport',
    name: 'เดินทาง',
    emoji: '🚗',
    color: '#3b82f6',
    icons: ['🚌', '🚕', '🏍️', '🚲', '🛵', '🚁', '⛵', '🅿️', '🚐', '🚙', '🚗', '🛺', '🚢', '🚠', '🚡', '🛤️', '🛣️', '⚓'],
  },
  {
    id: 'home',
    name: 'บ้าน',
    emoji: '🏠',
    color: '#ec4899',
    icons: ['🔌', '🛋️', '🛏️', '🚿', '🔑', '🧹', '🏢', '🏘️', '🪑', '🪞', '🛁', '🚽', '🪴', '🖼️', '🧊', '🌡️'],
  },
  {
    id: 'shopping',
    name: 'ช้อปปิ้ง',
    emoji: '🛒',
    color: '#d946ef',
    icons: ['👗', '👟', '👜', '💄', '👓', '⌚', '🧥', '👔', '👖', '🩳', '👠', '🧢', '🎒', '🧳', '💅', '🪒'],
  },
  {
    id: 'health',
    name: 'สุขภาพ',
    emoji: '💊',
    color: '#22c55e',
    icons: ['🏥', '💉', '🩺', '🧘', '🏃', '🦷', '👁️', '🧠', '❤️‍🩹', '🩻', '🩸', '🏊', '⛳', '🎾', '🏀'],
  },
  {
    id: 'entertainment',
    name: 'บันเทิง',
    emoji: '🎬',
    color: '#f43f5e',
    icons: ['🎵', '🎤', '🎧', '🎯', '🎲', '🎨', '🎪', '🎭', '🎰', '🎳', '🎱', '🃏', '🧩', '📷', '📹', '🎥'],
  },
  {
    id: 'family',
    name: 'ครอบครัว',
    emoji: '👨‍👩‍👧',
    color: '#0ea5e9',
    icons: ['🍽️', '🥂', '💐', '💍', '👶', '👴', '👫', '🤝', '🎊', '🎈', '💒', '⚰️', '🙏', '🏛️'],
  },
  {
    id: 'education',
    name: 'การศึกษา',
    emoji: '📚',
    color: '#2563eb',
    icons: ['✏️', '🎓', '📝', '🏫', '📐', '🖥️', '🖨️', '📰', '🗞️', '🔬', '🧪', '🌐'],
  },
  {
    id: 'travel',
    name: 'ท่องเที่ยว',
    emoji: '✈️',
    color: '#0891b2',
    icons: ['🏖️', '⛰️', '🏕️', '🗺️', '🏨', '🏩', '🎢', '🎡', '🏟️', '🗼', '🗽', '🌅', '🌄', '🏝️'],
  },
  {
    id: 'finance',
    name: 'การเงิน',
    emoji: '💰',
    color: '#059669',
    icons: ['💎', '🪙', '💹', '📋', '🏧', '💳', '💴', '💵', '💶', '💷', '🧮', '📊', '📉', '🏦'],
  },
  {
    id: 'pets',
    name: 'สัตว์เลี้ยง',
    emoji: '🐱',
    color: '#fb923c',
    icons: ['🐕', '🐦', '🐠', '🐈', '🐩', '🐇', '🐹', '🦜', '🐢', '🦎', '🐍', '🦔', '🐾'],
  },
  {
    id: 'other',
    name: 'อื่นๆ',
    emoji: '📦',
    color: '#64748b',
    icons: ['🔧', '⚙️', '🎂', '📬', '🧾', '🔨', '🪛', '🔩', '🪜', '🧰', '📦', '🏷️', '🎫', '📮', '🗑️'],
  },
];

// Flat array of all icons for backward compatibility
export const defaultCategoryStyles = iconGroups.flatMap(group =>
  group.icons.map(icon => ({ icon }))
);

// ============================================
// Utility Functions
// ============================================

// All categories combined for lookup
export const allCategoryConstants = [...expenseCategories, ...incomeCategories];

// Default fallback for unknown categories
const DEFAULT_EXPENSE_STYLE = { icon: "📦", color: "#64748b" };
const DEFAULT_INCOME_STYLE = { icon: "📥", color: "#22c55e" };

/**
 * Look up category style (icon & color) by name and type
 * Falls back to first character as icon if not found in constants
 */
export function getCategoryStyle(
  name: string,
  type: CategoryType
): { icon: string; color: string } {
  const categories = type === 'expense' ? expenseCategories : incomeCategories;
  const found = categories.find((c) => c.name === name);

  if (found?.icon && found?.color) {
    return { icon: found.icon, color: found.color };
  }

  // Return default based on type
  return type === 'expense' ? DEFAULT_EXPENSE_STYLE : DEFAULT_INCOME_STYLE;
}

/**
 * Get full category details from constants by name
 * Returns the constant category if found, otherwise creates a basic one
 */
export function getCategoryFromConstants(
  name: string,
  type: CategoryType
): Category | undefined {
  const categories = type === 'expense' ? expenseCategories : incomeCategories;
  return categories.find((c) => c.name === name);
}

/**
 * Enrich a stored category (with only name/type) with icon/color from constants
 */
export function enrichCategory(category: Category): Category {
  const style = getCategoryStyle(category.name, category.type);
  return {
    ...category,
    icon: category.icon || style.icon,
    color: category.color || style.color,
  };
}