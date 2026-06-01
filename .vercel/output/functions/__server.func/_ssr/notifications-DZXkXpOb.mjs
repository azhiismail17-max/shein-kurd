import { SCRIPT_URL } from "./index-CHMLBzfP.mjs";
async function fetchWithRetry(url, options, maxRetries = 2) {
  const fetchOptions = {
    ...options,
    // Google Apps Script redirects fail in modern browsers when third-party cookies are blocked or sent.
    // Omitting credentials prevents the browser from attaching cookies and failing the redirect.
    credentials: "omit"
  };
  let attempt = 0;
  while (attempt < maxRetries) {
    const ctrl = !fetchOptions.signal ? new AbortController() : null;
    const timeout = ctrl ? window.setTimeout(() => ctrl.abort(), 8e3) : null;
    try {
      const response = await fetch(url, ctrl ? { ...fetchOptions, signal: ctrl.signal } : fetchOptions);
      if (!response.ok) {
        if (response.status >= 429) {
          throw new Error(`Server error: ${response.status}`);
        }
      }
      return response;
    } catch (e) {
      attempt++;
      if (attempt >= maxRetries) {
        throw new Error(`Failed to fetch from ${url}. Error: ${e?.message || "Unknown"}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 250 * Math.pow(2, attempt - 1)));
    } finally {
      if (timeout) window.clearTimeout(timeout);
    }
  }
  throw new Error("Max retries exceeded");
}
const getTargetRoles = (type, senderRole) => {
  const rolePrefix = senderRole.split(" ")[0];
  if (type === "delete") {
    if (rolePrefix === "moderator") return ["owner", "admin"];
    if (rolePrefix === "admin") return ["owner", "moderator"];
    if (rolePrefix === "owner") return ["admin", "moderator"];
  }
  if (type === "edit" || type === "link" || type === "cancel") {
    if (rolePrefix === "admin" || rolePrefix === "moderator") return ["owner"];
    if (rolePrefix === "owner") return ["admin", "moderator"];
  }
  if (type === "warning") {
    return ["all"];
  }
  if (type === "approve") {
    return ["all"];
  }
  if (type === "deliver") {
    return ["owner"];
  }
  if (type === "custom") {
    if (rolePrefix === "owner") return ["admin", "moderator"];
    if (rolePrefix === "admin") return ["owner", "moderator"];
    if (rolePrefix === "moderator") return ["owner", "admin"];
  }
  return ["owner", "admin"];
};
const sendNotification = async (type, message, senderRole, order, isWarning = false, explicitTarget) => {
  if (!senderRole) return;
  if (type !== "approve" && type !== "warning" && type !== "custom" && !isWarning) return;
  let targetRoles = getTargetRoles(type, senderRole);
  if (explicitTarget) {
    targetRoles = [explicitTarget];
  }
  if (targetRoles.length === 0) return;
  const notification = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    type,
    message,
    senderRole,
    senderUsername: localStorage.getItem("auth_username") || void 0,
    targetRoles,
    orderId: order?.id,
    orderSheet: order?.sheet_name,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    readBy: [],
    isWarning
  };
  try {
    const payload = {
      action: "add_notification",
      notification
    };
    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    }).catch((e) => console.error("Notification Error", e));
  } catch (err) {
    console.error("Failed to send notification", err);
  }
};
const markNotificationFixed = async (notificationId, role) => {
  try {
    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "fix_notification", id: notificationId, fixedBy: role })
    }).catch(console.error);
  } catch (err) {
  }
};
const markNotificationRead = async (notificationId, role) => {
  try {
    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "read_notification", id: notificationId, readBy: role })
    }).catch(console.error);
  } catch (err) {
  }
};
const fetchNotifications = async () => {
  try {
    const res = await fetchWithRetry(`${SCRIPT_URL}?action=get_notifications`);
    if (!res.ok) return [];
    const text = await res.text();
    if (text.startsWith("<")) return [];
    const data = JSON.parse(text);
    if (data.status === "success" && data.notifications) {
      return data.notifications;
    }
    return [];
  } catch (err) {
    return [];
  }
};
const notifications = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  fetchNotifications,
  getTargetRoles,
  markNotificationFixed,
  markNotificationRead,
  sendNotification
}, Symbol.toStringTag, { value: "Module" }));
export {
  fetchWithRetry as a,
  markNotificationRead as b,
  fetchNotifications as f,
  markNotificationFixed as m,
  notifications as n,
  sendNotification as s
};
