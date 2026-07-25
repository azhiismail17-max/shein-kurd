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
  const isAllowedType =
    notification.type === "link" ||
    notification.type === "warning" ||
    notification.isWarning === true;
  const timestamp = Date.parse(String(notification.timestamp || ""));
  const age = Date.now() - timestamp;
  const isFresh = Number.isFinite(timestamp) && age >= -60_000 && age <= 10 * 60 * 1000;
  const wasAlreadySent =
    Array.isArray(notification.readBy) && notification.readBy.includes(PUSH_SENT_MARKER);

  if (!hasPhoneTarget || !isAllowedType || !isFresh) {
    return json({ error: "Notification is not eligible for phone push." }, 403);
  }
  if (wasAlreadySent) return json({ status: "already-sent", delivered: 0, failed: 0 });

  const boxLinkData = await getJson(`${scriptUrl}?action=get_box_links&role=owner&t=${Date.now()}`);
  const boxLinks = Array.isArray(boxLinkData?.box_links)
    ? (boxLinkData.box_links as StoredBoxLink[])
    : [];
  const subscriptions = new Map<string, webPush.PushSubscription>();

  for (const link of boxLinks) {
    if (link.sheet_name !== PUSH_REGISTRY_SHEET) continue;
    const rolePrefix = getRolePrefix(link.updated_role);
    if (!ALLOWED_ROLES.has(rolePrefix)) continue;
    if (!targetsAll && !targetRoles.includes(rolePrefix)) continue;

    const storedValue = String(link.total_link || "");
    if (!storedValue.startsWith(PUSH_SUBSCRIPTION_PREFIX)) continue;
    try {
      const subscription = JSON.parse(
        storedValue.slice(PUSH_SUBSCRIPTION_PREFIX.length),
      ) as webPush.PushSubscription;
      if (subscription?.endpoint) subscriptions.set(subscription.endpoint, subscription);
    } catch {
      // Ignore malformed or legacy registry rows.
    }
  }

  if (subscriptions.size === 0) {
    return json({ status: "no-subscribers", delivered: 0, failed: 0 });
  }

  webPush.setVapidDetails("mailto:notifications@shein-kurdwe.vercel.app", publicKey, privateKey);
  const isWarning = notification.type === "warning" || notification.isWarning === true;
  const payload = JSON.stringify({
    title: isWarning
      ? `${system === "iraqi" ? "Iraqi" : "Kurdistani"} Warning`
      : `${system === "iraqi" ? "Iraqi" : "Kurdistani"} Total Link`,
    body: String(notification.message || "").slice(0, 240),
    icon: "/logo-1080.png",
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

  return json({ status: delivered > 0 ? "sent" : "not-delivered", delivered, failed });
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
