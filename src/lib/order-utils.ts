import { Order } from "@/types";

export const uploadToImgBB = async (file: File): Promise<string> => {
  // Compress image to max 1200px width/height and 0.7 quality to be lightning fast
  const compressedFile = await compressImage(file);

  const apiKey = "3c43400a3770b8fc733935ff82e816fc"; // App's standard API key
  const formData = new FormData();
  formData.append("image", compressedFile, file.name || "image.jpg");

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (data.data?.url) return data.data.url;
  throw new Error("Failed to upload image");
};

export const fileToBase64 = async (file: File): Promise<string> => {
  const compressedFile = await compressImage(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(compressedFile);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDimension = 800;

        if (width > height && width > maxDimension) {
          height *= maxDimension / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width *= maxDimension / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file); // fallback
            }
          },
          "image/jpeg",
          0.6,
        );
      };
      img.onerror = () => resolve(file); // fallback
    };
    reader.onerror = () => resolve(file); // fallback
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
export const isSameCustomer = (a: Order, b: Order): boolean =>
  hasSameValidPhone(a, b) || hasSameInstagram(a, b);

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

const isWithinCustomerLinkWindow = (a: Order, b: Order) => {
  const aTime = parseOrderTime(a.date);
  const bTime = parseOrderTime(b.date);
  if (aTime === null || bTime === null) return false;
  const maxDiffMs = 3 * 24 * 60 * 60 * 1000;
  return Math.abs(aTime - bTime) <= maxDiffMs;
};

const isSameCustomerReceipt = (a: Order, b: Order) => {
  if (!isWithinCustomerLinkWindow(a, b)) return false;
  return hasSameValidPhone(a, b);
};

export function getLinkedGroup(order: Order, allOrders: Order[]): Order[] {
  const ordersByKey = new Map(allOrders.map((o) => [getOrderKey(o), o]));
  const clusterKeys = new Set<string>([getOrderKey(order)]);

  const hasManualUnlink = (aKey: string, bKey: string) => {
    const a = ordersByKey.get(aKey);
    const b = ordersByKey.get(bKey);
    const aBlocks = (a?.linkedOrderIds || [])
      .filter(isUnlinkMarker)
      .map((id) => normalizeUnlinkKey(id, a?.sheet_name));
    const bBlocks = (b?.linkedOrderIds || [])
      .filter(isUnlinkMarker)
      .map((id) => normalizeUnlinkKey(id, b?.sheet_name));
    return aBlocks.includes(bKey) || bBlocks.includes(aKey);
  };

  let changed = true;
  while (changed) {
    changed = false;
    for (const candidate of allOrders) {
      const candidateKey = getOrderKey(candidate);
      if (Array.from(clusterKeys).some((key) => hasManualUnlink(key, candidateKey))) continue;

      const linkedRefs = (candidate.linkedOrderIds || [])
        .filter((id) => !isUnlinkMarker(id))
        .map((id) => ({
          key: normalizeLinkedKey(id, candidate.sheet_name),
          isManualComposite: String(id).includes(":"),
        }));
      const linkedKeys = linkedRefs.map((ref) => ref.key);
      const sameCustomerReceipt = isSameCustomerReceipt(order, candidate);
      const touchesCluster =
        sameCustomerReceipt ||
        clusterKeys.has(candidateKey) ||
        linkedKeys.some((key) => clusterKeys.has(key));

      if (!touchesCluster) continue;
      const hasManualLinkToCluster = linkedRefs.some(
        (ref) => ref.isManualComposite && clusterKeys.has(ref.key),
      );
      const hasLegacyLinkToCluster = linkedRefs.some((ref) => clusterKeys.has(ref.key));
      const canAddCandidate =
        clusterKeys.has(candidateKey) ||
        sameCustomerReceipt ||
        hasManualLinkToCluster ||
        (hasLegacyLinkToCluster && isSameCustomerReceipt(order, candidate));
      if (!canAddCandidate) continue;

      if (!clusterKeys.has(candidateKey)) {
        clusterKeys.add(candidateKey);
        changed = true;
      }

      linkedRefs.forEach((ref) => {
        const linkedOrder = ordersByKey.get(ref.key);
        const canAddLinkedOrder =
          ref.isManualComposite || (linkedOrder && isSameCustomerReceipt(order, linkedOrder));
        if (linkedOrder && canAddLinkedOrder && !clusterKeys.has(ref.key)) {
          clusterKeys.add(ref.key);
          changed = true;
        }
      });
    }
  }

  return Array.from(clusterKeys)
    .map((key) => ordersByKey.get(key))
    .filter((o): o is Order => Boolean(o))
    .sort(
      (a, b) =>
        String(a.sheet_name).localeCompare(String(b.sheet_name)) || Number(a.id) - Number(b.id),
    );
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
  const shipping = getOrderShipping(order);
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
