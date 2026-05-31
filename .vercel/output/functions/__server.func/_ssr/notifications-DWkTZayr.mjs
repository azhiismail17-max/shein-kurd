import { b as SCRIPT_URL } from "./GlobalCalculator-qKTf8MtO.mjs";
import "../_libs/react.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "async_hooks";
import "stream";
import "util";
import "crypto";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/firebase__firestore.mjs";
import "../_libs/firebase__app.mjs";
import "../_libs/firebase__component.mjs";
import "../_libs/firebase__util.mjs";
import "../_libs/firebase__logger.mjs";
import "../_libs/idb.mjs";
import "../_libs/firebase__webchannel-wrapper.mjs";
import "../_libs/@grpc/grpc-js.mjs";
import "process";
import "tls";
import "fs";
import "os";
import "net";
import "events";
import "http2";
import "dns";
import "../_libs/@grpc/proto-loader.mjs";
import "path";
import "../_libs/lodash.camelcase.mjs";
import "../_libs/protobufjs.mjs";
import "../_libs/protobufjs__aspromise.mjs";
import "../_libs/protobufjs__base64.mjs";
import "../_libs/protobufjs__eventemitter.mjs";
import "../_libs/protobufjs__float.mjs";
import "../_libs/@protobufjs/inquire.mjs";
import "../_libs/protobufjs__utf8.mjs";
import "../_libs/protobufjs__pool.mjs";
import "../_libs/long.mjs";
import "../_libs/protobufjs__codegen.mjs";
import "../_libs/protobufjs__fetch.mjs";
import "../_libs/protobufjs__path.mjs";
import "http";
import "url";
import "zlib";
import "../_libs/firebase.mjs";
import "../_libs/firebase__storage.mjs";
import "../_libs/tesseract.js.mjs";
import "worker_threads";
import "../_libs/regenerator-runtime.mjs";
import "../_libs/node-fetch.mjs";
import "../_libs/whatwg-url.mjs";
import "../_libs/webidl-conversions.mjs";
import "punycode";
import "../_libs/tr46.mjs";
import "https";
import "../_libs/is-url.mjs";
import "../_libs/framer-motion.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
import "../_libs/lucide-react.mjs";
async function fetchWithRetry(url, options, maxRetries = 3) {
  const fetchOptions = {
    ...options,
    // Google Apps Script redirects fail in modern browsers when third-party cookies are blocked or sent.
    // Omitting credentials prevents the browser from attaching cookies and failing the redirect.
    credentials: "omit"
  };
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, fetchOptions);
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
