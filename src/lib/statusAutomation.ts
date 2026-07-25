const STATUS_TAG_RE =
  /\[(PENDING|APPROVED|PURCHASED|IN_TRANSIT|IN_WAREHOUSE|ARRIVED|CANCELLED)\]/gi;
const PURCHASED_AT_RE = /\s*\[PURCHASED_AT:([^\]]+)\]\s*/gi;
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

type StatusOrder = {
  extra?: string;
  is_finished?: boolean;
};

export function buildStatusExtra(
  currentExtra: string | undefined,
  newStatus: string,
  now = new Date(),
) {
  const cleanExtra = String(currentExtra || "")
    .replace(STATUS_TAG_RE, "")
    .replace(PURCHASED_AT_RE, " ")
    .replace(/\s*\|\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (newStatus === "none") return cleanExtra;

  const statusTag = `[${newStatus.toUpperCase()}]`;
  const purchasedAtTag = newStatus === "purchased" ? ` [PURCHASED_AT:${now.toISOString()}]` : "";
  return `${statusTag}${purchasedAtTag} ${cleanExtra}`.trim();
}

export function getPurchasedAtMs(order: StatusOrder) {
  const match = String(order.extra || "").match(/\[PURCHASED_AT:([^\]]+)\]/i);
  if (!match) return null;

  const time = new Date(match[1]).getTime();
  return Number.isNaN(time) ? null : time;
}

export function shouldAutoMovePurchasedToTransit(
  order: StatusOrder,
  status: string,
  now = new Date(),
) {
  if (order.is_finished || status !== "purchased") return false;

  const purchasedAt = getPurchasedAtMs(order);
  if (purchasedAt === null) return false;

  return now.getTime() - purchasedAt >= THREE_DAYS_MS;
}
