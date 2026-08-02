import { Order } from "@/types";
import { compressImage, uploadOrderImage } from "@/lib/image-store";

export { uploadOrderImage, uploadOrderImages } from "@/lib/image-store";

/**
 * Stores a photo and returns its URL.
 *
 * Kept under its old name because it is called from a dozen views; the pictures now go
 * to Supabase Storage rather than to ImgBB. Prefer `uploadOrderImage` in new code.
 */
export const uploadToImgBB = (file: File): Promise<string> => uploadOrderImage(file);

export const fileToBase64 = async (file: File): Promise<string> => {
  const compressedFile = await compressImage(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(compressedFile);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

export function cleanOrderNo(orderNo: string | number | undefined): string {
  if (!orderNo) return "";
  return String(orderNo)
    .replace(/\[(?:PENDING|APPROVED|PURCHASED|IN_TRANSIT|IN_WAREHOUSE|ARRIVED|CANCELLED)\]/gi, "")
    .replace(/\s*\|\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getBoxName(order: Order): string {
  let raw = "";
  if (order.box_name) raw = String(order.box_name).trim();
  else {
    const text = `${order.note || ""} ${order.extra || ""}`;
    const match = text.match(/box\s*(\d+)/i);
    if (match) raw = match[1];
  }

  if (raw.toLowerCase().startsWith("box ")) return raw.substring(4).trim();
  if (raw.toLowerCase().startsWith("box")) return raw.substring(3).trim();
  return raw;
}

/**
 * Whether an order already carries the free-shipping mark.
 *
 * Kept apart from `isOrderFree`, which also returns true for anything over the threshold.
 * What matters when saving is narrower: has *this* order had the shipping taken off its
 * price, because that is what the mark records and what the display adds back.
 */
export function carriesFreeShippingMark(order: Pick<Order, "extra" | "note">): boolean {
  const check = (value: string) => /free(?:\s|-)?(?:shipping|ship)?|\[zero_ship\]/i.test(value);
  return check(String(order.extra || "")) || check(String(order.note || ""));
}

export function isOrderFree(order: Order): boolean {
  const displayPrice = getDisplayPrice(order);
  const checkFree = (str: string) => /free(?:\s|-)?(?:shipping|ship)?|\[zero_ship\]/i.test(str);
  return (
    displayPrice > 118000 ||
    checkFree(String(order.extra || "")) ||
    checkFree(String(order.note || ""))
  );
}

function getRawOrderPrice(order: Order): number {
  return parseFloat(String(order.price).replace(/[^0-9.-]+/g, "")) || 0;
}

/**
 * Compute the standard shipping cost for a place string.
 * Mirrors the region pricing used by the order form.
 */
export function getRegionShipping(place: string | undefined | null): number {
  const p = String(place || "").toLowerCase();
  if (!p || p.includes("no location")) return 0;
  const isErbil =
    (p.includes("erbil") || p.includes("hawler") || p.includes("hewler") || p.includes("هەولێر")) &&
    !p.includes("outside erbil");
  if (isErbil) return 3000;
  if (
    p.includes("iraq") ||
    p.includes("baghdad") ||
    p.includes("basra") ||
    p.includes("outside kurdistan")
  )
    return 6000;
  return 5000;
}

/**
 * Free-shipping orders store customer price minus delivery in Column E.
 * The UI adds delivery back for display, which also preserves old saved rows.
 */
export function hasZeroShipMarker(order: Order): boolean {
  return /\[zero_ship\]/i.test(String(order.note || "") + " " + String(order.extra || ""));
}

const getOrderKey = (order: Pick<Order, "id" | "sheet_name">) => `${order.id}:${order.sheet_name}`;

const normalizeLinkedKey = (id: string | number, fallbackSheet: string | undefined) => {
  const text = String(id).trim();
  return text.includes(":") ? text : `${text}:${fallbackSheet || ""}`;
};

const isUnlinkMarker = (id: string | number) => String(id).trim().startsWith("!");

const normalizeUnlinkKey = (id: string | number, fallbackSheet: string | undefined) =>
  normalizeLinkedKey(String(id).trim().replace(/^!/, ""), fallbackSheet);

const normalizePhoneNumber = (value: unknown) => {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("964")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  const mobileMatch = digits.match(/7\d{9}/);
  if (!mobileMatch) return "";

  const phone = mobileMatch[0];
  const subscriber = phone.slice(3);
  if (/^0+$/.test(subscriber)) return "";
  if (/^(\d)\1+$/.test(phone)) return "";
  if ("0123456789".includes(phone) || "9876543210".includes(phone)) return "";
  return phone;
};

const getValidPhones = (order: Order) =>
  [normalizePhoneNumber(order.phone), normalizePhoneNumber(order.phone2)].filter(Boolean);

const hasSameValidPhone = (a: Order, b: Order) => {
  const aPhones = getValidPhones(a);
  const bPhones = getValidPhones(b);
  if (aPhones.length === 0 || bPhones.length === 0) return false;
  return aPhones.some((phone) => bPhones.includes(phone));
};

// An Instagram handle identifies one person. A display name does not - two
// different customers called "Sara" are two different customers, and matching on
// that is how unrelated orders used to end up merged. So the handle is compared,
// and the name is not considered at all.
const normalizeHandle = (value: unknown) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/\s+/g, "");

const hasSameInstagram = (a: Order, b: Order) => {
  const aHandle = normalizeHandle(a.insta);
  const bHandle = normalizeHandle(b.insta);
  return Boolean(aHandle) && aHandle === bHandle;
};

/**
 * The same phone number or the same Instagram handle. This is the only basis on
 * which two orders may ever be linked - automatically or by hand. Two orders
 * that match on neither belong to different people, so linking them is refused
 * outright rather than left to judgement.
 */
export const isSameCustomer = (a: Order, b: Order): boolean => {
  // Proof of identity is not enough on its own: two orders a month apart are two
  // shipments even for the same person, so the week window applies to a link
  // made by hand exactly as it does to one made automatically.
  if (!isWithinLinkWindow(a, b)) return false;
  // Phone only. A shared Instagram handle used to be enough, which suggested links
  // between different people who had simply ordered through the same account.
  return hasSameValidPhone(a, b);
};

const parseOrderTime = (value: unknown) => {
  const raw = String(value || "").trim();
  if (!raw || raw === "Unknown Date") return null;

  const localMatch = raw.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (localMatch) {
    const [, day, month, year, hour = "0", minute = "0", second = "0"] = localMatch;
    const time = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    ).getTime();
    return Number.isNaN(time) ? null : time;
  }

  const time = new Date(raw).getTime();
  return Number.isNaN(time) ? null : time;
};

const LINK_WINDOW_DAYS = 7;
const LINK_WINDOW_MS = LINK_WINDOW_DAYS * 24 * 60 * 60 * 1000;

/**
 * Orders may only be linked when they were placed within a week of each other.
 * Beyond that they are separate shipments, however clearly they belong to the
 * same person. A missing or unreadable date counts as outside the window - it
 * cannot be shown to be inside it, and guessing here merges real orders.
 */
export const isWithinLinkWindow = (a: Order, b: Order) => {
  const aTime = parseOrderTime(a.date);
  const bTime = parseOrderTime(b.date);
  if (aTime === null || bTime === null) return false;
  return Math.abs(aTime - bTime) <= LINK_WINDOW_MS;
};

const isSameCustomerReceipt = (a: Order, b: Order) => {
  if (!isWithinLinkWindow(a, b)) return false;
  return hasSameValidPhone(a, b);
};

/**
 * Every order that shares a receipt, keyed by any member's order key.
 *
 * Built as connected components rather than grown outwards from one order, which is what
 * fixes the long-standing complaint that two linked orders showed different totals. The
 * old code decided membership by comparing each candidate against *the order you happened
 * to open*, and one of those comparisons is a seven-day window. With orders on day 0, 5
 * and 9, opening the first saw {1,2} and opening the second saw {1,2,3} — so the same
 * group billed 28,000 from one order and 33,000 from another. A component is the same set
 * whichever member you enter it from, so every linked order now shows one receipt.
 *
 * Two kinds of edge join orders:
 *   - one made by hand, honoured whatever the details say, because a person chose it;
 *   - one found automatically, which needs the same phone and the week window.
 * An unlink made by hand beats both, and is the way to break a join that should not exist.
 */
const clusterCache = new WeakMap<Order[], Map<string, Order[]>>();

function buildClusters(allOrders: Order[]): Map<string, Order[]> {
  const cached = clusterCache.get(allOrders);
  if (cached) return cached;

  const parent = new Map<string, string>();
  const find = (key: string): string => {
    let root = key;
    while (parent.get(root) !== root) root = parent.get(root) as string;
    // Flattened so repeated lookups stay cheap on a long chain.
    let walk = key;
    while (parent.get(walk) !== root) {
      const next = parent.get(walk) as string;
      parent.set(walk, root);
      walk = next;
    }
    return root;
  };
  const union = (a: string, b: string) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent.set(rootA, rootB);
  };

  const byKey = new Map<string, Order>();
  for (const order of allOrders) {
    const key = getOrderKey(order);
    byKey.set(key, order);
    parent.set(key, key);
  }

  const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

  // Unlinks are collected first so no later edge can override one.
  const blocked = new Set<string>();
  for (const order of allOrders) {
    const key = getOrderKey(order);
    for (const id of order.linkedOrderIds || []) {
      if (!isUnlinkMarker(id)) continue;
      blocked.add(pairKey(key, normalizeUnlinkKey(id, order.sheet_name)));
    }
  }

  for (const order of allOrders) {
    const key = getOrderKey(order);
    for (const id of order.linkedOrderIds || []) {
      if (isUnlinkMarker(id)) continue;
      const other = normalizeLinkedKey(id, order.sheet_name);
      if (!byKey.has(other) || blocked.has(pairKey(key, other))) continue;
      union(key, other);
    }
  }

  // Bucketed by phone, so orders are only ever compared with others on the same number.
  // Comparing all of them with each other is four million pairs on a 2,000-row table and
  // this runs on every render.
  const byPhone = new Map<string, Order[]>();
  for (const order of allOrders) {
    for (const phone of getValidPhones(order)) {
      const bucket = byPhone.get(phone);
      if (bucket) bucket.push(order);
      else byPhone.set(phone, [order]);
    }
  }
  for (const bucket of byPhone.values()) {
    for (let i = 0; i < bucket.length; i++) {
      for (let j = i + 1; j < bucket.length; j++) {
        const a = bucket[i];
        const b = bucket[j];
        const keyA = getOrderKey(a);
        const keyB = getOrderKey(b);
        if (blocked.has(pairKey(keyA, keyB))) continue;
        if (!isWithinLinkWindow(a, b)) continue;
        union(keyA, keyB);
      }
    }
  }

  const byRoot = new Map<string, Order[]>();
  for (const key of byKey.keys()) {
    const root = find(key);
    const bucket = byRoot.get(root);
    if (bucket) bucket.push(byKey.get(key) as Order);
    else byRoot.set(root, [byKey.get(key) as Order]);
  }

  const clusters = new Map<string, Order[]>();
  for (const group of byRoot.values()) {
    const sorted = [...group].sort(
      (a, b) =>
        String(a.sheet_name).localeCompare(String(b.sheet_name)) || Number(a.id) - Number(b.id),
    );
    for (const member of sorted) clusters.set(getOrderKey(member), sorted);
  }

  clusterCache.set(allOrders, clusters);
  return clusters;
}

/**
 * The orders sharing a receipt with this one, itself included.
 *
 * The same set for every member of the group, so a receipt cannot change depending on
 * which of its orders is open.
 */
export function getLinkedGroup(order: Order, allOrders: Order[]): Order[] {
  return buildClusters(allOrders).get(getOrderKey(order)) ?? [order];
}

export function getDisplayPrice(order: Order, allOrders?: Order[]): number {
  const sheetPrice = getRawOrderPrice(order);
  if (!order._fromSheet) return sheetPrice;
  const checkFree = (str: string) => /free(?:\s|-)?(?:shipping|ship)?|\[zero_ship\]/i.test(str);
  const shipping = getOrderShipping(order);
  const markedFree =
    sheetPrice + shipping > 118000 ||
    checkFree(String(order.extra || "")) ||
    checkFree(String(order.note || ""));
  return markedFree ? sheetPrice + shipping : sheetPrice;
}

export function getOtherLinkedOrder(order: Order, allOrders: Order[]): Order | undefined {
  return getLinkedGroup(order, allOrders).find(
    (o) => o.id !== order.id || o.sheet_name !== order.sheet_name,
  );
}

export function getShippingAmount(
  shippingCost: string | number | undefined,
  place: string | undefined | null,
): number {
  const savedShipping = Math.abs(
    parseFloat(String(shippingCost || "").replace(/[^0-9.-]+/g, "")) || 0,
  );
  return savedShipping || getRegionShipping(place);
}

export function getSheetPriceForSave(
  price: string | number | undefined,
  place: string | undefined | null,
  freeShipping: boolean,
  shippingCost?: string | number,
): number {
  const fullPrice = parseFloat(String(price || "").replace(/[^0-9.-]+/g, "")) || 0;
  const shipping = getShippingAmount(shippingCost, place);
  return freeShipping ? Math.max(fullPrice - shipping, 0) : fullPrice;
}

export function getOrderShipping(order: Order): number {
  const placeLower = String(order.place || "").toLowerCase();
  if (placeLower.includes("no location")) return 0;
  return getRegionShipping(order.place);
}

export function getCustomerTotalPrice(order: Order, allOrders?: Order[]): number {
  return isOrderFree(order)
    ? getDisplayPrice(order, allOrders)
    : getDisplayPrice(order, allOrders) + getOrderShipping(order);
}

export function getLinkedOrdersInfo(order: Order, allOrders: Order[]) {
  const linkedOrders = getLinkedGroup(order, allOrders).filter(
    (o) => o.id !== order.id || o.sheet_name !== order.sheet_name,
  );

  const groupOrders = [order, ...linkedOrders];

  // One delivery for the whole group, so the charge cannot depend on which of
  // the linked orders happens to be open. Reading it off the open order meant a
  // group under the free-shipping threshold showed a different total from each
  // of its own orders - 38,000 from one and 40,000 from another for the same
  // group. The highest charge in the group is used: linked orders belong to one
  // customer and should share a destination, and where the recorded places
  // disagree this is the one that cannot undercharge. It also stops a stray
  // "No location" row from wiping out a real delivery charge.
  const shipping = groupOrders.reduce(
    (highest, item) => Math.max(highest, getOrderShipping(item)),
    0,
  );
  const combinedDisplayPrice = groupOrders.reduce(
    (sum, item) => sum + getDisplayPrice(item, allOrders),
    0,
  );
  const isFree = combinedDisplayPrice > 118000 || groupOrders.some((item) => isOrderFree(item));
  const basePrice = getDisplayPrice(order, allOrders);
  const baseInitial = parseFloat(String(order.initial_payment).replace(/[^0-9.-]+/g, "")) || 0;

  let combinedPrice = basePrice;
  let combinedInitial = baseInitial;

  linkedOrders.forEach((lo) => {
    combinedInitial += parseFloat(String(lo.initial_payment).replace(/[^0-9.-]+/g, "")) || 0;
    combinedPrice += getDisplayPrice(lo, allOrders);
  });

  const total = combinedPrice + (isFree ? 0 : shipping);
  const remaining = total - combinedInitial;

  return {
    linkedOrders,
    combinedPrice,
    combinedInitial,
    shipping,
    total,
    remaining,
    basePrice,
    baseInitial,
    isFree,
  };
}
