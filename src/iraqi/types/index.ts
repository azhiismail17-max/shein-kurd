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
  unique_order_id?: string;
  admin_name?: string;
  admin_role?: string;
  sku?: string;
  verified?: boolean;
  missing?: boolean;
  status?: OrderStatus;
  is_finished?: boolean;
  _fromSheet?: boolean;
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

export interface GiftCard {
  id: string;
  date: string;
  card_number: string;
  card_pin: string;
  payment_method: string;
  payment_other?: string;
  card_price: number;
  spent: number;
  remaining: number;
  linked_boxes: string[];
  notes?: string;
}

export interface BoxLink {
  id: string;
  sheet_name: string;
  box_name: string;
  total_link: string;
  image_url: string;
  pictures?: string[];
  warnings?: string[];
  updated_at?: string;
  updated_by?: string;
  updated_role?: string;
}

export interface ApiResponse {
  status: "success" | "error";
  data: Order[];
  box_links?: BoxLink[];
  meta: {
    active_sheet: string;
    monthly_stats: Record<string, MonthlyStats>;
    all_months?: string[];
  };
}

export const YEARS_CONFIG: Record<string, string[]> = {
  "2026": ["Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

const ORDER_SHEETS_BY_MONTH = [
  "Jun",
  "Jun",
  "Jun",
  "Jun",
  "Jun",
  "Jun",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function getCurrentOrderSheet(date = new Date()): string {
  return ORDER_SHEETS_BY_MONTH[date.getMonth()] || "Jun";
}

export const ACTIVE_ORDER_SHEET = getCurrentOrderSheet();

export const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwYc-fXYeZv8iQd4zyMExvSHZ3lsVtPVSbgfkmn37s5sE-cnvGjufYvdXWJXTiu23Q/exec";

const VERIFIED_KEY = "iraqi_shein_verified_orders";
const MISSING_KEY = "iraqi_shein_missing_orders";

export function getVerifiedSet(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(VERIFIED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}
export function saveVerifiedSet(s: Set<string>) {
  localStorage.setItem(VERIFIED_KEY, JSON.stringify([...s]));
}
export function getMissingSet(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(MISSING_KEY) || "[]"));
  } catch {
    return new Set();
  }
}
export function saveMissingSet(s: Set<string>) {
  localStorage.setItem(MISSING_KEY, JSON.stringify([...s]));
}

const MISSING_LOGS_KEY = "iraqi_shein_missing_images";
export function getMissingImages(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(MISSING_LOGS_KEY) || "{}");
  } catch {
    return {};
  }
}
export function saveMissingImages(data: Record<string, string>) {
  localStorage.setItem(MISSING_LOGS_KEY, JSON.stringify(data));
}

export type OrderStatus = "pending" | "purchased" | "in_transit" | "in_warehouse" | "arrived";

export const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "purchased",
  "in_transit",
  "in_warehouse",
  "arrived",
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  purchased: "Purchased",
  in_transit: "In transit",
  in_warehouse: "In warehouse",
  arrived: "Arrived",
};

export const STATUS_SHORT_LABELS: Record<OrderStatus, string> = {
  pending: "Pend",
  purchased: "Paid",
  in_transit: "Transit",
  in_warehouse: "Warehouse",
  arrived: "Arr",
};

export const STATUS_ICONS: Record<OrderStatus, string> = {
  pending: "⏳",
  purchased: "✅",
  in_transit: "🚚",
  in_warehouse: "🏬",
  arrived: "📦",
};

const normalizeStatusTag = (tag: string): OrderStatus => {
  const key = tag.toUpperCase().replace(/\s+/g, "_");
  if (key === "APPROVED") return "purchased";
  if (key === "CANCELLED") return "pending";
  if (key === "PURCHASED") return "purchased";
  if (key === "IN_TRANSIT") return "in_transit";
  if (key === "IN_WAREHOUSE") return "in_warehouse";
  if (key === "ARRIVED") return "arrived";
  return "pending";
};

// Any order is pending until explicit tag is set
export function getOrderStatus(order: Order): OrderStatus {
  const extraVal = String(order.extra || "").trim();
  const extraMatch = extraVal.match(
    /\[(PENDING|APPROVED|PURCHASED|IN_TRANSIT|IN_WAREHOUSE|ARRIVED|CANCELLED)\]/i,
  );
  if (extraMatch) return normalizeStatusTag(extraMatch[1]);

  const noteVal = String(order.note || "").trim();
  const noteMatch = noteVal.match(
    /\[(PENDING|APPROVED|PURCHASED|IN_TRANSIT|IN_WAREHOUSE|ARRIVED|CANCELLED)\]/i,
  );
  if (noteMatch) return normalizeStatusTag(noteMatch[1]);

  // Default to pending if no explicit status is set
  return "pending";
}

export const STATUS_COLORS: Record<string, string> = {
  pending:
    "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  purchased:
    "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  in_transit:
    "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
  in_warehouse:
    "bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
  arrived:
    "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
};

export const STATUS_ROW_COLORS: Record<string, string> = {
  pending: "",
  purchased: "",
  in_transit: "",
  in_warehouse: "bg-teal-50/50 dark:bg-teal-500/5",
  arrived: "bg-sky-50/50 dark:bg-sky-500/5",
};
