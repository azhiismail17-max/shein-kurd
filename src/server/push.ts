import * as webPush from "web-push";

const SCRIPT_URLS = {
  kurdistani:
    "https://script.google.com/macros/s/AKfycbwWF-1pFpNaIq9qx2BrMVU5qiEduvrgnOiejDmdc0e975LPmbfCSIqzGsg6dR5mWBM/exec",
  iraqi:
    "https://script.google.com/macros/s/AKfycbwYc-fXYeZv8iQd4zyMExvSHZ3lsVtPVSbgfkmn37s5sE-cnvGjufYvdXWJXTiu23Q/exec",
} as const;

const PUSH_REGISTRY_SHEET = "__push_registry__";
const PUSH_SUBSCRIPTION_PREFIX = "PUSH_SUB_V1:";
const PUSH_SENT_MARKER = "__phone_push_sent__";
const ALLOWED_ROLES = new Set(["owner", "admin"]);

type SystemName = keyof typeof SCRIPT_URLS;

interface StoredNotification {
  id: string;
  type: string;
  message: string;
  targetRoles: string[];
  timestamp: string;
  readBy?: string[];
  isWarning?: boolean;
}

interface StoredBoxLink {
  sheet_name?: string;
  total_link?: string;
  updated_role?: string;
}

interface StoredOrderLogRow {
  RawPayload?: string;
}

const NOTIFICATION_TITLES: Record<string, string> = {
  warning: "Warning",
  link: "Total Link",
  delete: "Order deleted",
  edit: "Order edited",
  approve: "Order purchased",
  deliver: "Order delivered",
  cancel: "Order cancelled",
  custom: "Update",
};

const getRolePrefix = (role?: string) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)[0];

async function getJson(url: string) {
  const response = await fetch(url, { cache: "no-store", redirect: "follow" });
  if (!response.ok) throw new Error(`Upstream request failed (${response.status})`);
  return response.json();
}

async function markPushSent(scriptUrl: string, notificationId: string) {
  const response = await fetch(scriptUrl, {
    method: "POST",
    redirect: "follow",
    body: JSON.stringify({
      action: "read_notification",
      id: notificationId,
      readBy: PUSH_SENT_MARKER,
    }),
  });
  if (!response.ok) throw new Error(`Could not mark push as sent (${response.status})`);
}

function getPushConfiguration() {
  return {
    publicKey: String(process.env.WEB_PUSH_PUBLIC_KEY || "").trim(),
    privateKey: String(process.env.WEB_PUSH_PRIVATE_KEY || "").trim(),
  };
}

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

// Recovering the registry from the write log means reading every logged write,
// which is a large response. Notifications can arrive in bursts, so the parsed
// result is reused briefly instead of refetching the whole log each time.
const RECOVERED_REGISTRY_TTL_MS = 5 * 60 * 1000;
const recoveredRegistryCache = new Map<
  string,
  { at: number; entries: Array<{ rolePrefix: string; subscription: webPush.PushSubscription }> }
>();

function parseStoredSubscription(value: unknown) {
  const stored = String(value || "");
  if (!stored.startsWith(PUSH_SUBSCRIPTION_PREFIX)) return null;
  try {
    const subscription = JSON.parse(
      stored.slice(PUSH_SUBSCRIPTION_PREFIX.length),
    ) as webPush.PushSubscription;
    return subscription?.endpoint ? subscription : null;
  } catch {
    return null;
  }
}

// The registry lives in the Box Link sheet, which is the fast path. Older Apps
// Script deployments answer `get_box_links` with the generic order dump instead
// of the registry, which used to leave this with zero subscribers - every phone
// silently got nothing. Those deployments still write an entry to the order log
// for each save, and that entry keeps the whole registration payload, so the
// same subscriptions stay recoverable from there until the script is updated.
async function readPushSubscriptions(
  scriptUrl: string,
  isTargetRole: (rolePrefix: string) => boolean,
) {
  const subscriptions = new Map<string, webPush.PushSubscription>();

  try {
    const boxLinkData = await getJson(
      `${scriptUrl}?action=get_box_links&role=owner&t=${Date.now()}`,
    );
    const boxLinks = Array.isArray(boxLinkData?.box_links)
      ? (boxLinkData.box_links as StoredBoxLink[])
      : [];
    for (const link of boxLinks) {
      if (link.sheet_name !== PUSH_REGISTRY_SHEET) continue;
      if (!isTargetRole(getRolePrefix(link.updated_role))) continue;
      const subscription = parseStoredSubscription(link.total_link);
      if (subscription) subscriptions.set(subscription.endpoint, subscription);
    }
  } catch (error) {
    console.error("Could not read the box-link push registry", error);
  }

  if (subscriptions.size > 0) return { subscriptions, source: "registry" as const };

  const cached = recoveredRegistryCache.get(scriptUrl);
  let entries =
    cached && Date.now() - cached.at < RECOVERED_REGISTRY_TTL_MS ? cached.entries : null;

  if (!entries) {
    entries = [];
    try {
      const logData = await getJson(`${scriptUrl}?action=get_orders&t=${Date.now()}`);
      const rows = Array.isArray(logData?.orders) ? (logData.orders as StoredOrderLogRow[]) : [];
      for (const row of rows) {
        const raw = String(row.RawPayload || "");
        if (!raw.includes(PUSH_SUBSCRIPTION_PREFIX)) continue;
        let payload: { role?: string; total_link?: string; sheet_name?: string };
        try {
          payload = JSON.parse(raw);
        } catch {
          continue;
        }
        if (payload.sheet_name !== PUSH_REGISTRY_SHEET) continue;
        const subscription = parseStoredSubscription(payload.total_link);
        if (subscription) entries.push({ rolePrefix: getRolePrefix(payload.role), subscription });
      }
      recoveredRegistryCache.set(scriptUrl, { at: Date.now(), entries });
    } catch (error) {
      console.error("Could not recover push subscriptions from the write log", error);
    }
  }

  for (const entry of entries) {
    if (!isTargetRole(entry.rolePrefix)) continue;
    subscriptions.set(entry.subscription.endpoint, entry.subscription);
  }

  return { subscriptions, source: "write-log" as const };
}

async function sendPush(request: Request) {
  const { publicKey, privateKey } = getPushConfiguration();
  if (!publicKey || !privateKey) {
    return json({ error: "Phone push is not configured." }, 503);
  }

  const body = (await request.json()) as { system?: string; notificationId?: string };
  const system = String(body.system || "") as SystemName;
  const notificationId = String(body.notificationId || "").trim();
  if (!(system in SCRIPT_URLS) || !notificationId) {
    return json({ error: "Invalid push request." }, 400);
  }

  const scriptUrl = SCRIPT_URLS[system];
  const notificationData = await getJson(`${scriptUrl}?action=get_notifications&t=${Date.now()}`);
  const notifications = Array.isArray(notificationData?.notifications)
    ? (notificationData.notifications as StoredNotification[])
    : [];
  const notification = notifications.find((item) => String(item.id) === notificationId);
  if (!notification) return json({ error: "Notification was not found." }, 404);

  const targetRoles = Array.isArray(notification.targetRoles)
    ? notification.targetRoles.map((role) => getRolePrefix(role)).filter(Boolean)
    : [];
  const targetsAll = targetRoles.includes("all");
  const hasPhoneTarget = targetsAll || targetRoles.some((role) => ALLOWED_ROLES.has(role));
  const timestamp = Date.parse(String(notification.timestamp || ""));
  const age = Date.now() - timestamp;
  const isFresh = Number.isFinite(timestamp) && age >= -60_000 && age <= 10 * 60 * 1000;
  const wasAlreadySent =
    Array.isArray(notification.readBy) && notification.readBy.includes(PUSH_SENT_MARKER);

  if (!hasPhoneTarget || !isFresh) {
    return json({ error: "Notification is not eligible for phone push." }, 403);
  }
  if (wasAlreadySent) return json({ status: "already-sent", delivered: 0, failed: 0 });

  const isTargetRole = (rolePrefix: string) =>
    ALLOWED_ROLES.has(rolePrefix) && (targetsAll || targetRoles.includes(rolePrefix));
  const { subscriptions, source } = await readPushSubscriptions(scriptUrl, isTargetRole);

  if (subscriptions.size === 0) {
    return json({ status: "no-subscribers", delivered: 0, failed: 0 });
  }

  webPush.setVapidDetails("mailto:notifications@shein-kurdwe.vercel.app", publicKey, privateKey);
  const isWarning = notification.type === "warning" || notification.isWarning === true;
  const systemLabel = system === "iraqi" ? "Iraqi" : "Kurdistani";
  const kind = isWarning ? "Warning" : NOTIFICATION_TITLES[notification.type] || "Update";
  const payload = JSON.stringify({
    title: `${systemLabel} ${kind}`,
    body: String(notification.message || "").slice(0, 240),
    icon: "/logo-192.png",
    tag: `box-alert-${notificationId}`,
    notificationId,
    system,
    url: system === "iraqi" ? "/iraqi" : "/",
  });

  const results = await Promise.allSettled(
    Array.from(subscriptions.values()).map((subscription) =>
      webPush.sendNotification(subscription, payload, {
        TTL: 60 * 60 * 24,
        urgency: "high",
      }),
    ),
  );
  const delivered = results.filter((result) => result.status === "fulfilled").length;
  const failed = results.length - delivered;

  // Keep an undelivered notification retryable. Only successful delivery earns the sent marker.
  if (delivered > 0) {
    await markPushSent(scriptUrl, notificationId).catch((error) => {
      console.error("Push delivered, but the sent marker could not be saved", error);
    });
  }

  return json({ status: delivered > 0 ? "sent" : "not-delivered", delivered, failed, source });
}

export async function handlePushRequest(request: Request): Promise<Response> {
  try {
    if (request.method === "GET") {
      const { publicKey } = getPushConfiguration();
      if (!publicKey) return json({ error: "Phone push is not configured." }, 503);
      return json({ publicKey });
    }

    if (request.method === "POST") return await sendPush(request);
    if (request.method === "OPTIONS") return new Response(null, { status: 204 });

    return json({ error: "Method not allowed." }, 405);
  } catch (error) {
    console.error("Phone push failed", error);
    return json({ error: "Phone push delivery failed." }, 500);
  }
}
