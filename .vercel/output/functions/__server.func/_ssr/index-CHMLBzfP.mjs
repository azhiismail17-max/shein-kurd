const YEARS_CONFIG = {
  "2025": ["April", "May", "Juni", "Julyi", "Augi", "Sept", "Octo", "Nove", "Dece"],
  "2026": ["Jan", "Feb", "March", "Apr", "Mayy", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"]
};
const ORDER_SHEETS_BY_MONTH = ["Jan", "Feb", "March", "Apr", "Mayy", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
function getCurrentOrderSheet(date = /* @__PURE__ */ new Date()) {
  return ORDER_SHEETS_BY_MONTH[date.getMonth()] || "Jun";
}
const ACTIVE_ORDER_SHEET = getCurrentOrderSheet();
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwWF-1pFpNaIq9qx2BrMVU5qiEduvrgnOiejDmdc0e975LPmbfCSIqzGsg6dR5mWBM/exec";
const VERIFIED_KEY = "shein_verified_orders";
const MISSING_KEY = "shein_missing_orders";
function getVerifiedSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(VERIFIED_KEY) || "[]"));
  } catch {
    return /* @__PURE__ */ new Set();
  }
}
function saveVerifiedSet(s) {
  localStorage.setItem(VERIFIED_KEY, JSON.stringify([...s]));
}
function getMissingSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(MISSING_KEY) || "[]"));
  } catch {
    return /* @__PURE__ */ new Set();
  }
}
function saveMissingSet(s) {
  localStorage.setItem(MISSING_KEY, JSON.stringify([...s]));
}
const MISSING_LOGS_KEY = "shein_missing_images";
function getMissingImages() {
  try {
    return JSON.parse(localStorage.getItem(MISSING_LOGS_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveMissingImages(data) {
  localStorage.setItem(MISSING_LOGS_KEY, JSON.stringify(data));
}
function getOrderStatus(order) {
  const extraVal = String(order.extra || "").trim();
  const extraMatch = extraVal.match(/\[(PENDING|APPROVED|ARRIVED|CANCELLED)\]/i);
  if (extraMatch) return extraMatch[1].toLowerCase();
  const noteVal = String(order.note || "").trim();
  const noteMatch = noteVal.match(/\[(PENDING|APPROVED|ARRIVED|CANCELLED)\]/i);
  if (noteMatch) return noteMatch[1].toLowerCase();
  return "pending";
}
const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  approved: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  arrived: "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
  cancelled: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
};
const STATUS_ROW_COLORS = {
  pending: "",
  approved: "",
  arrived: "bg-sky-50/50 dark:bg-sky-500/5",
  cancelled: "bg-red-50/50 dark:bg-red-500/5"
};
export {
  ACTIVE_ORDER_SHEET,
  SCRIPT_URL,
  STATUS_COLORS,
  STATUS_ROW_COLORS,
  YEARS_CONFIG,
  getCurrentOrderSheet,
  getMissingImages,
  getMissingSet,
  getOrderStatus,
  getVerifiedSet,
  saveMissingImages,
  saveMissingSet,
  saveVerifiedSet
};
