import { SCRIPT_URL as KURDISTANI_SCRIPT_URL } from "@/types";
import { SCRIPT_URL as IRAQI_SCRIPT_URL } from "@/iraqi/types";
import { fetchWithRetry } from "./fetchWithRetry";

const PUSH_REGISTRY_SHEET = "__push_registry__";
const PUSH_SUBSCRIPTION_PREFIX = "PUSH_SUB_V1:";
const REGISTERED_ENDPOINT_KEY = "phone_push_v3_endpoint";

export type PushRegistrationResult =
  | { ok: true; token: string; systems: Array<"kurdistani" | "iraqi"> }
  | { ok: false; reason: string };

const getRolePrefix = (role?: string | null) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)[0];

export function canRoleUsePush(role?: string | null) {
  const rolePrefix = getRolePrefix(role);
  return rolePrefix === "admin" || rolePrefix === "owner";
}

async function getServiceWorkerRegistration() {
  if (!("serviceWorker" in navigator)) return null;
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing?.active?.scriptURL.includes("/firebase-messaging-sw.js")) return existing;
  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
    scope: "/",
  });
  await navigator.serviceWorker.ready;
  return registration;
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

async function getPushPublicKey() {
  const response = await fetch("/api/push", { cache: "no-store" });
  if (!response.ok) throw new Error("Phone push service is not ready.");
  const data = await response.json();
  const publicKey = String(data?.publicKey || "").trim();
  if (!publicKey) throw new Error("Phone push public key is missing.");
  return publicKey;
}

async function getSubscriptionId(endpoint: string) {
  const bytes = new TextEncoder().encode(endpoint);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 40);
}

function hasMatchingApplicationServerKey(subscription: PushSubscription, publicKey: Uint8Array) {
  const existingKey = subscription.options.applicationServerKey;
  if (!existingKey) return false;
  const existingBytes = new Uint8Array(existingKey);
  return (
    existingBytes.length === publicKey.length &&
    existingBytes.every((value, index) => value === publicKey[index])
  );
}

async function saveSubscriptionForSystem({
  scriptUrl,
  role,
  username,
  subscriptionId,
  serialized,
}: {
  scriptUrl: string;
  role: string;
  username: string;
  subscriptionId: string;
  serialized: PushSubscriptionJSON;
}) {
  const response = await fetchWithRetry(scriptUrl, {
    method: "POST",
    body: JSON.stringify({
      action: "save_box_link",
      role,
      sheet_name: PUSH_REGISTRY_SHEET,
      box_name: `device:${subscriptionId}`,
      total_link: `${PUSH_SUBSCRIPTION_PREFIX}${JSON.stringify(serialized)}`,
      image_url: "",
      updated_by: username || role,
    }),
  });
  const result = JSON.parse(await response.text());
  if (result?.status !== "success")
    throw new Error(result?.message || "Could not register this phone.");
}

export async function enableWarningPushNotifications({
  role,
  username,
  system,
}: {
  role: string;
  username: string;
  system: "kurdistani" | "iraqi";
}): Promise<PushRegistrationResult> {
  const rolePrefix = getRolePrefix(role);
  if (!canRoleUsePush(role)) {
    return { ok: false, reason: "Only owner and admin users can enable phone push notifications." };
  }

  if (!("Notification" in window) || !("PushManager" in window)) {
    return { ok: false, reason: "This browser does not support phone push notifications." };
  }

  const permission =
    Notification.permission === "granted" ? "granted" : await Notification.requestPermission();

  if (permission !== "granted") {
    return { ok: false, reason: "Notifications were not allowed." };
  }

  try {
    const serviceWorkerRegistration = await getServiceWorkerRegistration();
    if (!serviceWorkerRegistration) {
      return { ok: false, reason: "Service worker registration failed." };
    }

    const publicKey = urlBase64ToUint8Array(await getPushPublicKey());
    let subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    if (subscription && !hasMatchingApplicationServerKey(subscription, publicKey)) {
      await subscription.unsubscribe();
      subscription = null;
    }
    if (!subscription) {
      subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      });
    }

    const serialized = subscription.toJSON();
    const subscriptionId = await getSubscriptionId(subscription.endpoint);

    // A browser has one push subscription for this site. Save that same device in
    // both Google Sheet registries so switching systems never disables the other one.
    await Promise.all([
      saveSubscriptionForSystem({
        scriptUrl: KURDISTANI_SCRIPT_URL,
        role: rolePrefix,
        username,
        subscriptionId,
        serialized,
      }),
      saveSubscriptionForSystem({
        scriptUrl: IRAQI_SCRIPT_URL,
        role: rolePrefix,
        username,
        subscriptionId,
        serialized,
      }),
    ]);

    localStorage.setItem("phone_push_v3_enabled", "true");
    localStorage.setItem("kurdistani_phone_push_v2_enabled", "true");
    localStorage.setItem("iraqi_phone_push_v2_enabled", "true");
    localStorage.setItem(REGISTERED_ENDPOINT_KEY, subscription.endpoint);
    window.dispatchEvent(new CustomEvent("phone-push:enabled", { detail: { system } }));
    return { ok: true, token: subscription.endpoint, systems: ["kurdistani", "iraqi"] };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Could not register this phone.",
    };
  }
}

// A browser silently replaces a push subscription from time to time (and drops
// it entirely if storage is cleared). Nothing used to notice: the "enabled" flag
// stayed set, so this device was never registered again and the saved endpoint
// quietly went dead - the phone simply stopped receiving anything. This re-saves
// the current subscription whenever it no longer matches what was registered,
// and writes nothing at all while the endpoint is unchanged.
export async function refreshPushRegistration({
  role,
  username,
}: {
  role: string;
  username: string;
}) {
  if (localStorage.getItem("phone_push_v3_enabled") !== "true") return;
  if (!canRoleUsePush(role)) return;
  if (!("Notification" in window) || !("PushManager" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    const serviceWorkerRegistration = await getServiceWorkerRegistration();
    if (!serviceWorkerRegistration) return;

    const publicKey = urlBase64ToUint8Array(await getPushPublicKey());
    let subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    if (subscription && !hasMatchingApplicationServerKey(subscription, publicKey)) {
      await subscription.unsubscribe();
      subscription = null;
    }
    if (!subscription) {
      subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      });
    }

    if (localStorage.getItem(REGISTERED_ENDPOINT_KEY) === subscription.endpoint) return;

    const serialized = subscription.toJSON();
    const subscriptionId = await getSubscriptionId(subscription.endpoint);
    const rolePrefix = getRolePrefix(role);
    await Promise.all([
      saveSubscriptionForSystem({
        scriptUrl: KURDISTANI_SCRIPT_URL,
        role: rolePrefix,
        username,
        subscriptionId,
        serialized,
      }),
      saveSubscriptionForSystem({
        scriptUrl: IRAQI_SCRIPT_URL,
        role: rolePrefix,
        username,
        subscriptionId,
        serialized,
      }),
    ]);
    localStorage.setItem(REGISTERED_ENDPOINT_KEY, subscription.endpoint);
  } catch (error) {
    console.warn("Could not refresh this phone's push registration", error);
  }
}

export async function disableWarningPushNotifications(_system: "kurdistani" | "iraqi") {
  const registration = await navigator.serviceWorker?.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) await subscription.unsubscribe();
  localStorage.removeItem("phone_push_v3_enabled");
  localStorage.removeItem("kurdistani_phone_push_v2_enabled");
  localStorage.removeItem("iraqi_phone_push_v2_enabled");
  localStorage.removeItem(REGISTERED_ENDPOINT_KEY);
}
