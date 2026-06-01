export interface Order {
  id: string | number;
  sheet_name: string;
  insta: string;
  name?: string;
  link?: string;
  place?: string;
  fib?: string;
  price: string | number;
  initial_payment?: string | number;
  phone?: string;
  phone2?: string;
  pics_text?: string | number;
  extra?: string;
  box_name?: string;
  box_cost?: string | number;
  shipping_cost?: string | number;
  lost?: string | number;
  profit?: string | number;
  note?: string;
  date?: string;
  orderNo?: string | number;
  trackNo?: string;
  primary_urls?: string;
  warningBase64?: string;
  warningImageUrl?: string;
  image_url?: string;
  proof_urls?: string[];
  imageBase64?: string;
  secondaryImages?: string[];
  linkedOrderIds?: (string | number)[];
  sku?: string;
  verified?: boolean;
  missing?: boolean;
  status?: 'pending' | 'approved' | 'arrived' | 'cancelled';
  is_finished?: boolean;
}

export interface MonthlyStats {
  count: number;
  revenue: number;
  balance: number;
  buy: number;
  wgt: number;
  etc: number;
  lost?: number;
}

export interface ApiResponse {
  status: 'success' | 'error';
  data: Order[];
  meta: {
    active_sheet: string;
    monthly_stats: Record<string, MonthlyStats>;
    all_months?: string[];
  };
}

export const YEARS_CONFIG: Record<string, string[]> = {
  '2026': ['Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const ORDER_SHEETS_BY_MONTH = ['Jun', 'Jun', 'Jun', 'Jun', 'Jun', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getCurrentOrderSheet(date = new Date()): string {
  return ORDER_SHEETS_BY_MONTH[date.getMonth()] || 'Jun';
}

export const ACTIVE_ORDER_SHEET = getCurrentOrderSheet();

export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwYc-fXYeZv8iQd4zyMExvSHZ3lsVtPVSbgfkmn37s5sE-cnvGjufYvdXWJXTiu23Q/exec';

const VERIFIED_KEY = 'iraqi_shein_verified_orders';
const MISSING_KEY = 'iraqi_shein_missing_orders';

export function getVerifiedSet(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(VERIFIED_KEY) || '[]')); } catch { return new Set(); }
}
export function saveVerifiedSet(s: Set<string>) {
  localStorage.setItem(VERIFIED_KEY, JSON.stringify([...s]));
}
export function getMissingSet(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(MISSING_KEY) || '[]')); } catch { return new Set(); }
}
export function saveMissingSet(s: Set<string>) {
  localStorage.setItem(MISSING_KEY, JSON.stringify([...s]));
}

const MISSING_LOGS_KEY = 'iraqi_shein_missing_images';
export function getMissingImages(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(MISSING_LOGS_KEY) || '{}'); } catch { return {}; }
}
export function saveMissingImages(data: Record<string, string>) {
  localStorage.setItem(MISSING_LOGS_KEY, JSON.stringify(data));
}

// Any order is pending until explicit tag is set
export function getOrderStatus(order: Order): 'pending' | 'approved' | 'arrived' | 'cancelled' {
  const extraVal = String(order.extra || '').trim();
  const extraMatch = extraVal.match(/\[(PENDING|APPROVED|ARRIVED|CANCELLED)\]/i);
  if (extraMatch) return extraMatch[1].toLowerCase() as any;

  const noteVal = String(order.note || '').trim();
  const noteMatch = noteVal.match(/\[(PENDING|APPROVED|ARRIVED|CANCELLED)\]/i);
  if (noteMatch) return noteMatch[1].toLowerCase() as any;
  
  // Default to pending if no explicit status is set
  return 'pending';
}

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  approved: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  arrived: 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20',
  cancelled: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
};

export const STATUS_ROW_COLORS: Record<string, string> = {
  pending: '',
  approved: '',
  arrived: 'bg-sky-50/50 dark:bg-sky-500/5',
  cancelled: 'bg-red-50/50 dark:bg-red-500/5',
};
