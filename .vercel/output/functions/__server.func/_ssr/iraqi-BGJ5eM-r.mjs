import { r as reactExports, j as jsxRuntimeExports, a as React__default } from "../_libs/react.mjs";
import { Y as YEARS_CONFIG, A as ACTIVE_ORDER_SHEET, S as SCRIPT_URL, o as recordOrderDeleted, j as getOrderStatus, x as useToast, T as ThemeColorPicker, c as SystemSwitcher, G as GlobalCalculatorButton, p as recordPresence, f as ensureBrowserNotificationPermission, v as showBrowserNotification } from "./use-toast-CUyDYyz5.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a6 as User, u as Lock, t as LoaderCircle, L as LayoutDashboard, Z as ShoppingCart, w as MessageCircle, C as Calculator, a8 as Wallet, P as Package, Q as Plus, a4 as Truck, a7 as Users, a9 as X, v as LogOut, M as Menu, i as ChevronLeft, T as Search, e as Camera, c as Bell, Y as ShieldAlert, g as Check } from "../_libs/lucide-react.mjs";
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
const uploadToImgBB = async (file) => {
  const compressedFile = await compressImage(file);
  const apiKey = "3c43400a3770b8fc733935ff82e816fc";
  const formData = new FormData();
  formData.append("image", compressedFile, file.name || "image.jpg");
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData
  });
  const data = await response.json();
  if (data.data?.url) return data.data.url;
  throw new Error("Failed to upload image");
};
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result;
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
              resolve(file);
            }
          },
          "image/jpeg",
          0.6
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};
function cleanOrderNo(orderNo) {
  if (!orderNo) return "";
  return String(orderNo).replace(/\[(?:PENDING|APPROVED|ARRIVED|CANCELLED)\]/gi, "").replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();
}
function getBoxName(order) {
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
function isOrderFree(order) {
  const checkFree = (str) => str.toLowerCase().includes("free") || str.toLowerCase().includes("[zero_ship]");
  return checkFree(String(order.extra || "")) || checkFree(String(order.note || ""));
}
function getRegionShipping(place) {
  const p = String(place || "").toLowerCase();
  if (!p || p.includes("no location")) return 0;
  const isErbil = (p.includes("erbil") || p.includes("hawler") || p.includes("hewler") || p.includes("هەولێر")) && !p.includes("outside erbil");
  if (isErbil) return 3e3;
  if (p.includes("iraq") || p.includes("baghdad") || p.includes("basra") || p.includes("outside kurdistan")) return 6e3;
  return 5e3;
}
function getLinkedGroup(order, allOrders) {
  const clusterIds = /* @__PURE__ */ new Set();
  clusterIds.add(String(order.id));
  if (order.linkedOrderIds) {
    order.linkedOrderIds.forEach((id) => clusterIds.add(String(id).split(":")[0]));
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const o of allOrders) {
      if (o.sheet_name !== order.sheet_name) continue;
      const idStr = String(o.id);
      const oHasMatch = clusterIds.has(idStr) || o.linkedOrderIds?.some((l) => clusterIds.has(String(l).split(":")[0]));
      if (oHasMatch) {
        if (!clusterIds.has(idStr)) {
          clusterIds.add(idStr);
          changed = true;
        }
        if (o.linkedOrderIds) {
          for (const lId of o.linkedOrderIds) {
            const rawId = String(lId).split(":")[0];
            if (!clusterIds.has(rawId)) {
              clusterIds.add(rawId);
              changed = true;
            }
          }
        }
      }
    }
  }
  const result = allOrders.filter((o) => o.sheet_name === order.sheet_name && clusterIds.has(String(o.id)));
  return result.sort((a, b) => Number(a.id) - Number(b.id));
}
function getDisplayPrice(order, allOrders) {
  const rawPrice = parseFloat(String(order.price).replace(/[^0-9.-]+/g, "")) || 0;
  if (isOrderFree(order)) {
    return rawPrice + getRegionShipping(order.place);
  }
  return rawPrice;
}
function getOrderShipping(order) {
  const placeLower = String(order.place || "").toLowerCase();
  if (placeLower.includes("no location")) return 0;
  return getRegionShipping(order.place);
}
function getCustomerTotalPrice(order, allOrders) {
  return isOrderFree(order) ? getDisplayPrice(order) : getDisplayPrice(order) + getOrderShipping(order);
}
function getLinkedOrdersInfo(order, allOrders) {
  const linkedOrders = getLinkedGroup(order, allOrders).filter((o) => o.id !== order.id || o.sheet_name !== order.sheet_name);
  const basePrice = getDisplayPrice(order);
  const baseInitial = parseFloat(String(order.initial_payment).replace(/[^0-9.-]+/g, "")) || 0;
  let combinedPrice = basePrice;
  let combinedInitial = baseInitial;
  linkedOrders.forEach((lo) => {
    combinedPrice += getDisplayPrice(lo);
    combinedInitial += parseFloat(String(lo.initial_payment).replace(/[^0-9.-]+/g, "")) || 0;
  });
  const isFree = isOrderFree(order) || linkedOrders.some((lo) => isOrderFree(lo));
  const shipping = getOrderShipping(order);
  const total = combinedPrice + (isFree ? 0 : shipping);
  const remaining = total - combinedInitial;
  return { linkedOrders, combinedPrice, combinedInitial, shipping, total, remaining, basePrice, baseInitial, isFree };
}
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
    senderUsername: localStorage.getItem("iraqi_auth_username") || void 0,
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
const NotificationsDropdown = ({ role, onNotificationClick }) => {
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const [notifications, setNotifications] = reactExports.useState([]);
  const [customMsg, setCustomMsg] = reactExports.useState("");
  const [isSending, setIsSending] = reactExports.useState(false);
  const [showMentions, setShowMentions] = reactExports.useState(false);
  const [mentionFilter, setMentionFilter] = reactExports.useState("");
  const [authUsers, setAuthUsers] = reactExports.useState([]);
  const [selectedTarget, setSelectedTarget] = reactExports.useState(null);
  const rolePrefix = role ? role.split(" ")[0] : "";
  reactExports.useEffect(() => {
    ensureBrowserNotificationPermission();
  }, []);
  reactExports.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetchWithRetry(`${SCRIPT_URL}?action=get_auth_users`);
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.warn("Invalid JSON from Apps Script:", text.substring(0, 50));
          data = { status: "error" };
        }
        if (data.status === "success" && data.users) {
          const users = data.users.map((u) => typeof u === "string" ? u : String(u.username || "")).map((u) => u.trim()).filter(Boolean);
          setAuthUsers(users);
        } else {
          setAuthUsers([]);
        }
      } catch (e) {
        setAuthUsers([]);
      }
    };
    if (role) fetchUsers();
  }, [role]);
  reactExports.useEffect(() => {
    if (!role) return;
    const fetchNots = async () => {
      const data = await fetchNotifications();
      const currentUsername = localStorage.getItem("iraqi_auth_username") || "";
      const filtered = data.filter((n) => {
        if (n.senderUsername === currentUsername || n.senderRole === role) {
          if (n.senderUsername === currentUsername) return false;
          if (!n.senderUsername && n.senderRole === role) return false;
        }
        return n.targetRoles.includes(role) || n.targetRoles.includes(rolePrefix) || currentUsername && n.targetRoles.includes(currentUsername) || n.targetRoles.includes("all");
      });
      setNotifications((prev) => {
        const prevIds = new Set(prev.map((p) => p.id));
        const newNots = filtered.filter((f) => !prevIds.has(f.id));
        const now = Date.now();
        newNots.forEach((n) => {
          const isRecent = now - new Date(n.timestamp).getTime() < 15e3;
          const isSender = n.senderUsername === currentUsername || !n.senderUsername && n.senderRole === role;
          if (isRecent && !isSender) {
            showBrowserNotification(n.isWarning ? "Warning Alert" : "New Notification", {
              body: n.message,
              tag: `iraqi-notification-${n.id}`
            });
            if (n.isWarning) {
              toast.error("🚨 Warning Alert", { description: n.message, duration: 8e3 });
            } else {
              toast("🔔 New Notification", { description: n.message });
            }
          }
        });
        return filtered;
      });
    };
    fetchNots();
    const interval = setInterval(fetchNots, 1e3);
    return () => clearInterval(interval);
  }, [role, rolePrefix]);
  const currentReadKey = localStorage.getItem("iraqi_auth_username") || role || "";
  const isNotificationRead = (n) => n.readBy.includes(role || "") || !!currentReadKey && n.readBy.includes(currentReadKey);
  const unreadCount = notifications.filter((n) => !isNotificationRead(n)).length;
  const handleRead = (id) => {
    if (!role) return;
    const readKey = currentReadKey || role;
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, readBy: Array.from(new Set([...n.readBy, role, readKey].filter(Boolean))) } : n));
    markNotificationRead(id, readKey);
  };
  const handleFix = (id) => {
    if (!role) return;
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, fixedBy: role } : n));
    markNotificationFixed(id, role);
  };
  const handleSendCustom = async () => {
    if (!customMsg.trim() || !role) return;
    setIsSending(true);
    let finalTarget = void 0;
    const mentionMatch = customMsg.match(/@([\w\s]+?)(?=\s|$)/);
    if (mentionMatch) {
      const possibleUser = mentionMatch[1].trim();
      if (authUsers.some((u) => u.toLowerCase() === possibleUser.toLowerCase())) {
        const matchedUser = authUsers.find((u) => u.toLowerCase() === possibleUser.toLowerCase());
        finalTarget = matchedUser;
      }
    }
    if (!finalTarget && selectedTarget && customMsg.includes(`@${selectedTarget}`)) {
      finalTarget = selectedTarget;
    }
    await sendNotification("custom", customMsg, role, void 0, false, finalTarget);
    setCustomMsg("");
    setSelectedTarget(null);
    setShowMentions(false);
    setIsSending(false);
  };
  const handleInputChange = (e) => {
    const val = e.target.value;
    setCustomMsg(val);
    if (val.includes("@")) {
      const lastAt = val.lastIndexOf("@");
      const textAfterAt = val.substring(lastAt + 1).toLowerCase();
      if (!val.includes(" ", lastAt)) {
        setShowMentions(true);
        setMentionFilter(textAfterAt);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
      setSelectedTarget(null);
    }
  };
  const selectMention = (user) => {
    const lastAt = customMsg.lastIndexOf("@");
    const newMsg = customMsg.substring(0, lastAt) + `@${user} `;
    setCustomMsg(newMsg);
    setSelectedTarget(user);
    setShowMentions(false);
  };
  if (!role) return null;
  const filteredUsers = authUsers.filter((u) => u.toLowerCase().includes(mentionFilter));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsOpen(!isOpen), className: "p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors relative", title: "Notifications", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 18 }),
      unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-sm animate-pulse" })
    ] }),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-40", onClick: () => setIsOpen(false) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 p-0 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border bg-muted/30 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-lg flex items-center gap-2 text-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 18, className: "text-primary" }),
            "Notifications"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsOpen(false), className: "p-1.5 bg-secondary hover:bg-secondary/80 text-muted-foreground rounded-md transition-colors sm:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[60vh] overflow-y-auto w-full p-2", children: notifications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-20 text-center text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 40, className: "mx-auto mb-4 opacity-20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-base text-foreground mb-1", children: "All caught up" }),
          "No notifications yet"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: notifications.map((n) => {
          const isRead = isNotificationRead(n);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-4 rounded-xl border transition-colors ${!isRead ? "bg-red-50 border-red-300 shadow-sm relative overflow-hidden dark:bg-red-950/20 dark:border-red-900/60" : "bg-transparent border-transparent"}`, children: [
            !isRead && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 top-0 bottom-0 w-1 bg-red-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-1 shrink-0 ${!isRead || n.isWarning ? "text-red-500 animate-pulse" : "text-primary"}`, children: n.isWarning ? /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 20 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-base ${!isRead ? "font-medium text-foreground" : "text-muted-foreground"}`, children: n.message }),
                n.orderId && n.orderSheet && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => {
                      if (onNotificationClick) {
                        onNotificationClick(String(n.orderId), n.orderSheet);
                        setIsOpen(false);
                      }
                    },
                    className: "mt-2 text-primary font-medium hover:underline text-sm block",
                    children: "View Order"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground font-mono", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-50", children: "•" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize font-semibold text-primary/70", children: n.senderRole }),
                  n.targetRoles.length === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-1.5 py-0.5 bg-primary/10 text-primary rounded-sm", children: [
                    "to @",
                    n.targetRoles[0]
                  ] })
                ] }),
                !isRead && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleRead(n.id), className: "text-xs text-red-600 font-bold hover:underline mt-3 inline-block", children: "Mark as Read" }),
                n.isWarning && !n.fixedBy && (rolePrefix === "admin" || rolePrefix === "moderator") && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleFix(n.id), className: "w-full mt-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16 }),
                  " Acknowledge / Fixed"
                ] }),
                n.isWarning && n.fixedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 px-3 py-1.5 bg-red-900/10 rounded-lg text-xs font-bold text-red-900 inline-flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14 }),
                  " Fixed by ",
                  n.fixedBy
                ] })
              ] })
            ] })
          ] }, n.id);
        }) }) }),
        rolePrefix && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t border-border bg-card relative z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]", children: [
          showMentions && filteredUsers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-full left-4 mr-4 mb-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-48 w-64 animate-in slide-in-from-bottom-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-1.5 bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border", children: "Select User" }),
            filteredUsers.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => selectMention(u), className: "w-full text-left px-4 py-2.5 hover:bg-secondary text-sm font-medium transition-colors border-b border-border/50 last:border-0", children: [
              "@",
              u
            ] }, u))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                placeholder: "Type @ to notify specific user...",
                value: customMsg,
                onChange: handleInputChange,
                className: "flex-1 bg-secondary/50 border border-border text-foreground text-sm rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                disabled: isSending || !customMsg.trim(),
                onClick: handleSendCustom,
                className: "px-6 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary/90 disabled:opacity-50 active:scale-95 transition-all shadow-sm",
                children: "Send"
              }
            )
          ] })
        ] })
      ] })
    ] })
  ] });
};
const ALL_MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "calculator", label: "Calculator", icon: Calculator },
  { id: "expenses", label: "Masrufat", icon: Wallet },
  { id: "batches", label: "Boxes", icon: Package },
  { id: "new-order", label: "New Order", icon: Plus },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "team", label: "Team", icon: Users }
];
const AppLayout = ({
  children,
  activeTab,
  setActiveTab,
  searchQuery = "",
  setSearchQuery,
  isSearchingAll,
  onSearchAll,
  onCameraSearch,
  viewingMonth,
  setViewingMonth,
  activeYear,
  setActiveYear,
  availableMonths = [],
  role,
  onLogout,
  onNotificationClick,
  currentSystem = "iraqi",
  onSystemChange
}) => {
  const [sidebarOpen, setSidebarOpen] = reactExports.useState(false);
  const [searchExpanded, setSearchExpanded] = reactExports.useState(false);
  const [localSearch, setLocalSearch] = reactExports.useState(searchQuery);
  const [hasUnreadMessages, setHasUnreadMessages] = reactExports.useState(false);
  reactExports.useEffect(() => {
    try {
      const lastReadMap = JSON.parse(localStorage.getItem("iraqi_messages_last_read") || "{}");
      const allLastReads = Object.values(lastReadMap);
      let isMounted = true;
      import("./use-toast-CUyDYyz5.mjs").then((n) => n.g).then(({ db }) => {
        import("../_libs/firebase.mjs").then(({ collection, query, onSnapshot }) => {
          const q = query(collection(db, "topics"));
          const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!isMounted) return;
            let unread = false;
            const updatedLastReads = JSON.parse(localStorage.getItem("iraqi_messages_last_read") || "{}");
            snapshot.docs.forEach((doc) => {
              const data = doc.data();
              if (data.lastMessageAt && data.lastMessageAt.toMillis && data.lastMessageAt.toMillis() > (updatedLastReads[doc.id] || 0)) {
                if (doc.id.startsWith("dm_")) {
                  const currentUser = localStorage.getItem("iraqi_auth_username") || role;
                  if (!doc.id.includes(currentUser.toLowerCase())) return;
                }
                unread = true;
              }
            });
            setHasUnreadMessages(unread && activeTab !== "messages");
          });
          return () => unsubscribe();
        });
      });
      return () => {
        isMounted = false;
      };
    } catch {
    }
  }, [activeTab, role]);
  reactExports.useEffect(() => {
    let interval;
    const currentUser = localStorage.getItem("iraqi_auth_username") || role;
    const pingPresence = () => recordPresence("iraqi", currentUser, role, true).catch(() => {
    });
    const setOffline = () => recordPresence("iraqi", currentUser, role, false).catch(() => {
    });
    pingPresence();
    interval = setInterval(pingPresence, 3e4);
    window.addEventListener("beforeunload", setOffline);
    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener("beforeunload", setOffline);
      setOffline();
    };
  }, [role]);
  reactExports.useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);
  reactExports.useEffect(() => {
    const t = setTimeout(() => {
      if (setSearchQuery && localSearch !== searchQuery) {
        setSearchQuery(localSearch);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [localSearch, setSearchQuery, searchQuery]);
  const showBack = activeTab === "new-order";
  const menuItems = ALL_MENU_ITEMS.filter((item) => {
    if (role === "owner") return true;
    if (role === "admin") {
      return item.id !== "dashboard";
    }
    if (role === "moderator") {
      return item.id === "calculator" || item.id === "orders" || item.id === "new-order" || item.id === "messages" || item.id === "team";
    }
    if (role === "delivery") {
      return item.id === "calculator" || item.id === "delivery" || item.id === "messages" || item.id === "team";
    }
    return item.id === "calculator";
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-[100dvh] w-full bg-background text-foreground font-sans flex overflow-hidden transition-colors duration-300", children: [
    sidebarOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden", onClick: () => setSidebarOpen(false) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: `fixed lg:static inset-y-0 left-0 z-50 w-[82vw] max-w-72 lg:w-64 bg-card border-r border-border transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 flex items-center justify-between border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 bg-primary rounded-xl flex items-center justify-center glow-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-primary-foreground text-sm", children: "S" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-bold text-base tracking-tight", children: [
              "Shein ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "Kurd" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold", children: [
              role,
              " Hub"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSidebarOpen(false), className: "lg:hidden text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 px-3 py-4 space-y-1 overflow-y-auto", children: menuItems.map((item) => {
        const Icon = item.icon;
        const active = activeTab === item.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setActiveTab(item.id);
              setSidebarOpen(false);
            },
            className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium
                    ${active ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 18 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.label }),
              item.id === "messages" && hasUnreadMessages && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-2 w-2 h-2 rounded-full bg-red-500 glow-red animate-pulse" }),
              active && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto w-1.5 h-1.5 rounded-full bg-primary glow-primary" })
            ]
          },
          item.id
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t border-border space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeColorPicker, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onLogout, className: "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 18 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Sign Out" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col min-w-0 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2 sm:px-4 py-1.5 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSidebarOpen(true), className: "lg:hidden relative p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { size: 20 }),
            hasUnreadMessages && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 glow-red ring-2 ring-card" })
          ] }),
          showBack ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveTab("orders"), className: "hidden md:flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 20 }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "hidden md:block text-lg font-bold capitalize whitespace-nowrap", children: activeTab === "new-order" ? "New Order" : activeTab })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0 w-full max-w-none sm:max-w-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors", size: 16 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "Search...",
              value: localSearch,
              onChange: (e) => {
                setLocalSearch(e.target.value);
                if (e.target.value && activeTab !== "orders") setActiveTab("orders");
              },
              className: "w-full bg-secondary border border-border text-foreground text-base sm:text-sm rounded-lg pl-9 pr-8 py-1.5 sm:py-2 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
            }
          ),
          localSearch && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setLocalSearch("");
            setSearchQuery?.("");
          }, className: "absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5 sm:gap-1 shrink-0", children: [
          isSearchingAll && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden sm:flex flex items-center gap-2 text-xs text-primary font-medium mr-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" }),
            "Loading..."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsDropdown, { role, onNotificationClick }),
          role === "owner" && /* @__PURE__ */ jsxRuntimeExports.jsx(SystemSwitcher, { role, current: currentSystem, onChange: onSystemChange }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onCameraSearch, className: "p-1.5 sm:p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors", title: "Image Search", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 18 }) }),
          role === "owner" && /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalCalculatorButton, { variant: "inline" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: `flex-1 min-h-0 ${activeTab === "messages" ? "overflow-hidden p-0" : "overflow-y-auto p-2 sm:p-4 lg:p-6 custom-scrollbar"}`, children })
    ] })
  ] });
};
const LoginView = ({ onLogin }) => {
  const [username, setUsername] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const { toast: toast2 } = useToast();
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    try {
      const payload = new URLSearchParams();
      payload.append("action", "login");
      payload.append("username", username);
      payload.append("password", password);
      let data = {};
      try {
        const res = await fetchWithRetry(SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: payload.toString()
        });
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.log("Backend did not return JSON, using fallback mode");
          data = { status: "error", message: "Backend not updated" };
        }
      } catch (networkError) {
        console.log("Network error, using fallback mode");
        data = { status: "error", message: "Network error" };
      }
      if (data.status !== "success") {
        const hardcodedUsers = {
          "owner": { pass: "mostang2021", role: "owner" },
          "admin": { pass: "shein4321", role: "admin" },
          "modertor": { pass: "shein1234", role: "moderator" },
          "delvery": { pass: "sheindelivery", role: "delivery" }
        };
        const user = hardcodedUsers[username.toLowerCase().trim()];
        if (user && user.pass === password) {
          data = { status: "success", role: user.role };
        } else {
          data = { status: "error", message: "Invalid username or password" };
        }
      }
      if (data.status === "success") {
        localStorage.setItem("iraqi_auth_role", data.role);
        localStorage.setItem("iraqi_auth_username", username.toLowerCase().trim());
        onLogin(data.role);
      } else {
        toast2({ title: "Error", description: data.message || "Invalid credentials", variant: "destructive" });
      }
    } catch (e2) {
      toast2({ title: "Error", description: "Failed to connect. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm bg-card border border-border rounded-xl shadow-xl p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-6 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: "/logo.jpg",
          alt: "Shein Kurdistani",
          className: "w-32 h-48 object-cover rounded-2xl shadow-2xl border-2 border-primary/20",
          onError: (e) => {
            e.target.src = "https://placehold.co/400x600/600/FFF?text=Shein\\nKurdistani";
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Welcome Back" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Sign in to your account" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "Username" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", size: 18 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: username,
              onChange: (e) => setUsername(e.target.value),
              className: "w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-primary transition-colors",
              placeholder: "Enter username"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", size: 18 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              className: "w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-primary transition-colors",
              placeholder: "Enter password"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "w-full bg-primary text-primary-foreground font-medium rounded-lg py-2.5 flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-70 mt-6",
          children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin", size: 20 }) : "Sign In"
        }
      )
    ] })
  ] }) });
};
const DashboardView = React__default.lazy(() => import("./DashboardView-Vv3fUJnO.mjs"));
const OrderFormView = React__default.lazy(() => import("./OrderFormView-Bb7tK8fX.mjs"));
const OrderListView = React__default.lazy(() => import("./OrderListView-2UGWv6h5.mjs"));
const OrderDetailModal = React__default.lazy(() => import("./OrderDetailModal-Cy-K7pvt.mjs"));
const BatchesView = React__default.lazy(() => import("./BatchesView-Bh_9ADLb.mjs"));
const ExpensesView = React__default.lazy(() => import("./ExpensesView-N1xu8D6C.mjs"));
const CalculatorView = React__default.lazy(() => import("./CalculatorView-C8tEn16k.mjs"));
const CameraSearchModal = React__default.lazy(() => import("./CameraSearchModal-DbHPkN5l.mjs"));
const MessagesView = React__default.lazy(() => import("./MessagesView-CVF8nGbL.mjs"));
const TeamView = React__default.lazy(() => import("./TeamView-vXkndIXe.mjs"));
const DEFAULT_YEAR = Object.keys(YEARS_CONFIG).sort().pop() || "2026";
const DEFAULT_MONTH = ACTIVE_ORDER_SHEET;
const ALL_MONTHS = Object.values(YEARS_CONFIG).flat();
const sheetIndex = {};
let globalIdx = 0;
for (const year of Object.keys(YEARS_CONFIG).sort()) {
  for (const month of YEARS_CONFIG[year]) {
    sheetIndex[month] = globalIdx++;
  }
}
const globalSort = (a, b) => {
  const diff = (sheetIndex[b.sheet_name] ?? 0) - (sheetIndex[a.sheet_name] ?? 0);
  if (diff !== 0) return diff;
  return Number(b.id) - Number(a.id);
};
const getSearchFields = (o) => [o.insta, o.name, o.phone, o.phone2, o.place, o.orderNo, o.extra, o.link, o.sku, o.sheet_name];
const buildSearchText = (o) => getSearchFields(o).map((f) => String(f || "").toLowerCase()).join(" ");
const Index = () => {
  const [role, setRole] = reactExports.useState(() => localStorage.getItem("iraqi_auth_role"));
  const [activeTab, setActiveTab] = reactExports.useState(() => localStorage.getItem("iraqi_app_activeTab") || "orders");
  reactExports.useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.startsWith("#messages:")) {
        setActiveTab("messages");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);
  const [activeYear, setActiveYear] = reactExports.useState(() => {
    const saved = localStorage.getItem("iraqi_app_activeYear");
    return saved && YEARS_CONFIG[saved] ? saved : DEFAULT_YEAR;
  });
  const [activeMonth, setActiveMonth] = reactExports.useState(DEFAULT_MONTH);
  const [viewingMonth, setViewingMonth] = reactExports.useState(() => {
    const saved = localStorage.getItem("iraqi_app_viewingMonth");
    return saved && ALL_MONTHS.includes(saved) ? saved : DEFAULT_MONTH;
  });
  reactExports.useEffect(() => {
    localStorage.setItem("iraqi_app_activeTab", activeTab);
  }, [activeTab]);
  reactExports.useEffect(() => {
    localStorage.setItem("iraqi_app_activeYear", activeYear);
  }, [activeYear]);
  reactExports.useEffect(() => {
    localStorage.setItem("iraqi_app_activeMonth", activeMonth);
  }, [activeMonth]);
  reactExports.useEffect(() => {
    localStorage.setItem("iraqi_app_viewingMonth", viewingMonth);
  }, [viewingMonth]);
  const [allOrders, setAllOrders] = reactExports.useState([]);
  const [monthlyStats, setMonthlyStats] = reactExports.useState({});
  const [loading, setLoading] = reactExports.useState(true);
  const [loadedMonths, setLoadedMonths] = reactExports.useState(/* @__PURE__ */ new Set());
  const [editingOrder, setEditingOrder] = reactExports.useState(null);
  const [selectedOrder, setSelectedOrder] = reactExports.useState(null);
  const [searchQuery, setSearchQuery] = reactExports.useState(() => localStorage.getItem("iraqi_app_searchQuery") || "");
  const [isSearchingAll, setIsSearchingAll] = reactExports.useState(false);
  const [showCameraSearch, setShowCameraSearch] = reactExports.useState(false);
  reactExports.useEffect(() => {
    localStorage.setItem("iraqi_app_searchQuery", searchQuery);
  }, [searchQuery]);
  reactExports.useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem("iraqi_app_scrollY", window.scrollY.toString());
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  reactExports.useEffect(() => {
    if (!loading) {
      const scrollY = sessionStorage.getItem("iraqi_app_scrollY");
      if (scrollY) {
        setTimeout(() => window.scrollTo({ top: parseInt(scrollY), behavior: "instant" }), 0);
      }
    }
  }, [loading]);
  const loadedMonthsRef = reactExports.useRef(loadedMonths);
  loadedMonthsRef.current = loadedMonths;
  const historyLoadStartedRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!localStorage.getItem("iraqi_app_activeTab")) {
      if (role === "owner") {
        setActiveTab("dashboard");
      } else {
        setActiveTab("orders");
      }
    }
  }, [role]);
  const mergeOrders = reactExports.useCallback((prev, newData, sheetToReplace) => {
    const filtered = prev.filter((o) => o.sheet_name !== sheetToReplace);
    return [...filtered, ...newData];
  }, []);
  const applyApiResponse = reactExports.useCallback((json, isBackground) => {
    if (json.status !== "success") return;
    setMonthlyStats(json.meta.monthly_stats || {});
    const scriptActiveSheet = json.meta.active_sheet || DEFAULT_MONTH;
    setActiveMonth(scriptActiveSheet);
    if (!isBackground) {
      if (!localStorage.getItem("iraqi_app_viewingMonth") || !ALL_MONTHS.includes(localStorage.getItem("iraqi_app_viewingMonth") || "")) setViewingMonth(scriptActiveSheet);
      if (!localStorage.getItem("iraqi_app_activeYear") || !YEARS_CONFIG[localStorage.getItem("iraqi_app_activeYear") || ""]) setActiveYear(DEFAULT_YEAR);
    }
    if (json.data?.length) {
      const sheet = json.data[0].sheet_name;
      setAllOrders((prev) => mergeOrders(prev, json.data, sheet));
      setLoadedMonths((prev) => new Set(prev).add(sheet));
    }
  }, [mergeOrders]);
  const fetchInitialData = reactExports.useCallback(async () => {
    if (!role) return;
    const cached = localStorage.getItem("iraqi_app_initial_data");
    let hasCached = false;
    if (cached) {
      try {
        const json = JSON.parse(cached);
        applyApiResponse(json, false);
        hasCached = true;
        setLoading(false);
      } catch (e) {
        console.warn("Iraqi cache error", e);
      }
    }
    if (!hasCached) setLoading(true);
    try {
      const res = await fetchWithRetry(`${SCRIPT_URL}?t=${Date.now()}`);
      const text = await res.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.warn("Invalid JSON:", text.substring(0, 50));
      }
      if (json && json.status === "success") {
        localStorage.setItem("iraqi_app_initial_data", JSON.stringify(json));
        applyApiResponse(json, hasCached);
      }
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [applyApiResponse, role]);
  const fetchMonthData = reactExports.useCallback(async (month, force = false) => {
    if (!role) return;
    if (!force && loadedMonthsRef.current.has(month)) return;
    const cacheKey = `iraqi_app_month_data_${month}`;
    const cached = localStorage.getItem(cacheKey);
    let hasCached = false;
    if (cached) {
      try {
        const json = JSON.parse(cached);
        if (json.status === "success") {
          setAllOrders((prev) => mergeOrders(prev, json.data, month));
          setLoadedMonths((prev) => new Set(prev).add(month));
          hasCached = true;
        }
      } catch (e) {
      }
    }
    if (!hasCached && allOrders.length === 0) setLoading(true);
    try {
      const res = await fetchWithRetry(`${SCRIPT_URL}?month=${month}&t=${Date.now()}`);
      const text = await res.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.warn("Invalid DB JSON");
      }
      if (json && json.status === "success") {
        localStorage.setItem(cacheKey, JSON.stringify(json));
        setAllOrders((prev) => mergeOrders(prev, json.data, month));
        setLoadedMonths((prev) => new Set(prev).add(month));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [allOrders.length, mergeOrders, role]);
  const loadAllHistory = reactExports.useCallback(async () => {
    setIsSearchingAll(true);
    const pending = Object.values(YEARS_CONFIG).flat().filter(
      (m) => !loadedMonthsRef.current.has(m) && monthlyStats[m]?.count > 0
    );
    const CONCURRENCY = 4;
    let i = 0;
    const workers = Array.from({ length: Math.min(CONCURRENCY, pending.length) }, async () => {
      while (i < pending.length) {
        const m = pending[i++];
        await fetchMonthData(m);
      }
    });
    await Promise.all(workers);
    setIsSearchingAll(false);
  }, [monthlyStats, fetchMonthData]);
  reactExports.useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);
  reactExports.useEffect(() => {
    if (viewingMonth && !loadedMonths.has(viewingMonth)) fetchMonthData(viewingMonth);
  }, [viewingMonth, loadedMonths, fetchMonthData]);
  reactExports.useEffect(() => {
    if (loading || historyLoadStartedRef.current || Object.keys(monthlyStats).length === 0) return;
    historyLoadStartedRef.current = true;
    const run = () => loadAllHistory();
    const idleId = "requestIdleCallback" in window ? window.requestIdleCallback(run, { timeout: 2500 }) : window.setTimeout(run, 1500);
    return () => {
      if (typeof idleId === "number") window.clearTimeout(idleId);
      else if ("cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
    };
  }, [loading, monthlyStats, loadAllHistory]);
  const forceRefreshMonth = reactExports.useCallback(async (month) => {
    if (!role) return;
    localStorage.removeItem(`iraqi_app_month_data_${month}`);
    localStorage.removeItem("iraqi_app_initial_data");
    try {
      const resMain = await fetchWithRetry(`${SCRIPT_URL}?t=${Date.now()}`);
      const textMain = await resMain.text();
      let jsonMain = null;
      try {
        jsonMain = JSON.parse(textMain);
      } catch (e) {
      }
      if (jsonMain && jsonMain.status === "success") {
        localStorage.setItem("iraqi_app_initial_data", JSON.stringify(jsonMain));
        setMonthlyStats(jsonMain.meta.monthly_stats || {});
        if (jsonMain.meta.active_sheet) setActiveMonth(jsonMain.meta.active_sheet);
        if (jsonMain.data?.length) {
          const sheet = jsonMain.data[0].sheet_name;
          setAllOrders((prev) => mergeOrders(prev, jsonMain.data, sheet));
          setLoadedMonths((prev) => new Set(prev).add(sheet));
        }
      }
      const resMonth = await fetchWithRetry(`${SCRIPT_URL}?month=${month}&t=${Date.now()}`);
      const textMonth = await resMonth.text();
      let jsonMonth = null;
      try {
        jsonMonth = JSON.parse(textMonth);
      } catch (e) {
      }
      if (jsonMonth && jsonMonth.status === "success") {
        localStorage.setItem(`iraqi_app_month_data_${month}`, JSON.stringify(jsonMonth));
        setAllOrders((prev) => mergeOrders(prev, jsonMonth.data, month));
        setLoadedMonths((prev) => new Set(prev).add(month));
      }
    } catch (err) {
      console.warn("Force refresh issue (network/timeout):", err instanceof Error ? err.message : err);
    }
  }, [mergeOrders, role]);
  const refreshTimeoutRef = reactExports.useRef({});
  const refreshInFlightRef = reactExports.useRef({});
  const refreshQueuedRef = reactExports.useRef({});
  const silentRefresh = reactExports.useCallback((month) => {
    if (!role) return;
    const target = month || viewingMonth;
    if (refreshTimeoutRef.current[target]) {
      clearTimeout(refreshTimeoutRef.current[target]);
    }
    refreshTimeoutRef.current[target] = setTimeout(async () => {
      if (refreshInFlightRef.current[target]) {
        refreshQueuedRef.current[target] = true;
        return;
      }
      refreshInFlightRef.current[target] = true;
      let timeout;
      try {
        const ctrl = new AbortController();
        (silentRefresh._ctrls ||= {})[target] = ctrl;
        timeout = window.setTimeout(() => ctrl.abort(), 7e3);
        const res = await fetch(`${SCRIPT_URL}?month=${target}&skip_stats=true&t=${Date.now()}`, { credentials: "omit", signal: ctrl.signal });
        const text = await res.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (e) {
        }
        if (json && json.status === "success") {
          localStorage.setItem(`iraqi_app_month_data_${target}`, JSON.stringify(json));
          setMonthlyStats((prev) => ({ ...prev, ...json.meta.monthly_stats }));
          if (json.meta.active_sheet) setActiveMonth(json.meta.active_sheet);
          if (json.data?.length) {
            setAllOrders((prev) => mergeOrders(prev, json.data, target));
            setLoadedMonths((prev) => new Set(prev).add(target));
          }
        }
      } catch (_) {
      } finally {
        if (timeout) window.clearTimeout(timeout);
        refreshInFlightRef.current[target] = false;
        if (refreshQueuedRef.current[target]) {
          refreshQueuedRef.current[target] = false;
          silentRefresh(target);
        }
      }
    }, 0);
  }, [viewingMonth, mergeOrders, role]);
  const handleDelete = reactExports.useCallback(async (id, sheetName) => {
    const orderToDelete = allOrders.find((o) => o.id === id && o.sheet_name === sheetName);
    setAllOrders((prev) => prev.filter((o) => !(o.id === id && o.sheet_name === sheetName)));
    if (orderToDelete) {
      sendNotification("delete", `Order deleted: ${orderToDelete.name || orderToDelete.insta}`, role, orderToDelete);
    }
    try {
      await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "delete",
          row_id: id,
          sheet: sheetName
        })
      });
      recordOrderDeleted("iraqi", sheetName, id).catch((err) => console.warn("Failed to update Iraqi team delete stats", err));
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => silentRefresh(sheetName), 250);
  }, [silentRefresh]);
  const handleFormSuccess = reactExports.useCallback((payload, rowIdStr) => {
    setEditingOrder(null);
    setActiveTab("orders");
    if (payload) {
      setAllOrders((prev) => {
        const idToFind = payload.row_id || (rowIdStr ? parseInt(rowIdStr.replace(/\D/g, "")) : Date.now());
        const tempId = payload._tempId;
        const exists = prev.some((o) => o.id === idToFind && o.sheet_name === payload.sheet);
        if (tempId && tempId !== idToFind) {
          const hasTemp = prev.some((o) => o.id === tempId && o.sheet_name === payload.sheet);
          if (hasTemp) {
            return prev.map(
              (o) => o.id === tempId && o.sheet_name === payload.sheet ? { ...o, ...payload, id: idToFind } : o
            );
          }
        }
        const newLinkedIds = Array.isArray(payload.linkedOrderIds) ? payload.linkedOrderIds : [];
        const patchLinkedSides = (orders) => {
          if (newLinkedIds.length === 0) return orders;
          const sourceKey = `${idToFind}:${payload.sheet}`;
          return orders.map((o) => {
            const oKey = `${o.id}:${o.sheet_name}`;
            if (!newLinkedIds.includes(oKey) && !newLinkedIds.includes(o.id)) return o;
            const existing = Array.isArray(o.linkedOrderIds) ? o.linkedOrderIds : [];
            if (existing.includes(sourceKey) || existing.includes(idToFind)) return o;
            return { ...o, linkedOrderIds: [...existing, sourceKey] };
          });
        };
        if (exists) {
          sendNotification("edit", `Order ${payload.insta || "edited"} was modified`, role, { id: idToFind, sheet_name: payload.sheet });
          const updated = prev.map((o) => o.id === idToFind && o.sheet_name === payload.sheet ? { ...o, ...payload } : o);
          return patchLinkedSides(updated);
        } else {
          const newOrder = {
            id: idToFind,
            sheet_name: payload.sheet || viewingMonth,
            ...payload
          };
          return patchLinkedSides([newOrder, ...prev]);
        }
      });
    }
    silentRefresh(viewingMonth);
    setTimeout(() => silentRefresh(viewingMonth), 900);
  }, [silentRefresh, viewingMonth]);
  const handleStatusChange = reactExports.useCallback(async (order, newStatus) => {
    if (order.is_finished) return;
    const currentExtra = order.extra || "";
    const cleanExtra = currentExtra.replace(/\[(PENDING|APPROVED|ARRIVED|CANCELLED)\]/gi, "").replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();
    const newExtra = newStatus === "none" ? cleanExtra : `[${newStatus.toUpperCase()}] ${cleanExtra}`.trim();
    setAllOrders((prev) => prev.map((o) => o.id === order.id && o.sheet_name === order.sheet_name ? { ...o, extra: newExtra } : o));
    if (newStatus === "DELIVERY_SCANNED" || newStatus === "arrived") {
      sendNotification("deliver", `Order arrived/delivered: ${order.name || order.insta}`, role, order);
    } else if (newStatus === "cancelled") {
      sendNotification("cancel", `Order cancelled: ${order.name || order.insta}`, role, order);
    }
    try {
      const displayPrice = getDisplayPrice(order, allOrders);
      const proofStr = Array.isArray(order.proof_urls) ? order.proof_urls.filter(Boolean).join(",") : order.proof_urls || "";
      await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({
        ...order,
        price: displayPrice,
        sheet: order.sheet_name,
        row_id: order.id,
        extra: newExtra,
        force_update: true,
        status_color: newStatus,
        // Preserve proof images across status updates (Apps Script overwrites empty fields)
        proof_urls: proofStr,
        image_url: order.image_url || proofStr || "",
        primary_urls: order.primary_urls || ""
      }) });
    } catch (e) {
      console.error(e);
    }
    silentRefresh(order.sheet_name);
    setTimeout(() => silentRefresh(order.sheet_name), 250);
  }, [silentRefresh]);
  const handleBatchRefresh = reactExports.useCallback(() => {
    silentRefresh(viewingMonth);
  }, [silentRefresh, viewingMonth]);
  reactExports.useEffect(() => {
    if (!role) return;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") silentRefresh();
    }, 5e3);
    return () => clearInterval(interval);
  }, [silentRefresh, role]);
  reactExports.useEffect(() => {
    if (!role) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") silentRefresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [silentRefresh, role]);
  const sortedOrders = reactExports.useMemo(() => [...allOrders].sort(globalSort), [allOrders]);
  const searchEntries = reactExports.useMemo(() => sortedOrders.map((order) => {
    const text = buildSearchText(order);
    return { order, text, digits: text.replace(/\D/g, "").replace(/^0+/, "") };
  }), [sortedOrders]);
  const filteredOrders = reactExports.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list;
    if (q === "pending") list = sortedOrders.filter((o) => o.sheet_name === viewingMonth && getOrderStatus(o) === "pending");
    else if (q === "pic") list = sortedOrders.filter((o) => o.imageBase64 || o.image_url || o.primary_urls || o.warningBase64 || o.proof_urls?.length || o.secondaryImages?.length);
    else if (q) {
      const qDigits = q.replace(/\D/g, "");
      const qStripped = qDigits.replace(/^0+/, "");
      list = searchEntries.filter((e) => e.text.includes(q) || qStripped && e.digits.includes(qStripped)).map((e) => e.order);
    } else list = sortedOrders.filter((o) => o.sheet_name === viewingMonth);
    return list;
  }, [sortedOrders, searchEntries, viewingMonth, searchQuery]);
  const deliveryOrders = reactExports.useMemo(() => {
    const allArrived = sortedOrders.filter((o) => getOrderStatus(o) === "arrived" || String(o.note || "").includes("[DELIVERY_SCANNED]") || String(o.extra || "").includes("[DELIVERY_SCANNED]"));
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allArrived;
    const qDigits = q.replace(/\D/g, "");
    const qStripped = qDigits.replace(/^0+/, "");
    return searchEntries.filter(
      (e) => (getOrderStatus(e.order) === "arrived" || String(e.order.note || "").includes("[DELIVERY_SCANNED]") || String(e.order.extra || "").includes("[DELIVERY_SCANNED]")) && (e.text.includes(q) || qStripped && e.digits.includes(qStripped))
    ).map((e) => e.order);
  }, [sortedOrders, searchEntries, searchQuery]);
  const availableMonths = reactExports.useMemo(() => {
    return (YEARS_CONFIG[activeYear] || []).filter(
      (m) => m === activeMonth || m === ACTIVE_ORDER_SHEET || (monthlyStats[m]?.count || 0) > 0 || allOrders.some((o) => o.sheet_name === m)
    );
  }, [activeYear, activeMonth, monthlyStats, allOrders]);
  reactExports.useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(viewingMonth)) {
      setViewingMonth(availableMonths[0]);
    }
  }, [availableMonths, viewingMonth]);
  const handleUpdateOrder = reactExports.useCallback((id, sheet, updates) => {
    const existing = allOrders.find((o) => o.id === id && o.sheet_name === sheet);
    if (existing?.is_finished) return;
    setAllOrders((prev) => prev.map((o) => o.id === id && o.sheet_name === sheet ? { ...o, ...updates } : o));
  }, [allOrders]);
  const renderContent = () => {
    if (loading && allOrders.length === 0) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-20 min-h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center flex flex-col items-center justify-center space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: "/logo.jpg",
            alt: "Shein Kurdistani Logo",
            className: "w-24 h-36 object-cover rounded-xl shadow-lg border-2 border-primary/20 animate-pulse",
            onError: (e) => {
              e.target.src = "https://placehold.co/200x300/400/FFF?text=Loading...";
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm font-bold tracking-widest uppercase", children: "Loading..." })
        ] })
      ] }) });
    }
    switch (activeTab) {
      case "dashboard":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardView, { stats: monthlyStats[viewingMonth], orders: filteredOrders, viewingMonth, availableMonths, setViewingMonth, setActiveTab, setSearchQuery, onNewOrder: () => setActiveTab("new-order"), activeYear, setActiveYear });
      case "new-order":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(OrderFormView, { activeSheet: activeMonth, editingOrder, onCancel: () => {
          setEditingOrder(null);
          setActiveTab("orders");
        }, onSuccess: handleFormSuccess, allOrders });
      case "orders":
      case "customers":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(OrderListView, { role, isDeliveryTab: false, orders: filteredOrders, onEdit: (o) => {
          setEditingOrder(o);
          setActiveTab("new-order");
        }, onDelete: handleDelete, onOrderClick: setSelectedOrder, allOrders, viewingMonth, setViewingMonth, activeYear, setActiveYear, availableMonths, onStatusChange: handleStatusChange, onNewOrder: () => setActiveTab("new-order"), onUpdateOrder: handleUpdateOrder });
      case "delivery":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(OrderListView, { role, isDeliveryTab: true, orders: deliveryOrders, onEdit: (o) => {
          setEditingOrder(o);
          setActiveTab("new-order");
        }, onDelete: handleDelete, onOrderClick: setSelectedOrder, allOrders, viewingMonth, setViewingMonth, activeYear, setActiveYear, availableMonths, onStatusChange: handleStatusChange, onNewOrder: () => setActiveTab("new-order"), onUpdateOrder: handleUpdateOrder });
      case "batches":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(BatchesView, { role, orders: allOrders.filter((o) => o.sheet_name === viewingMonth), allOrders, onOrderClick: setSelectedOrder, viewingMonth, setViewingMonth, availableMonths, activeYear, setActiveYear, onRefresh: handleBatchRefresh, onStatusChange: handleStatusChange });
      case "expenses":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ExpensesView, {});
      case "calculator":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CalculatorView, {});
      case "messages":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(MessagesView, { role, allOrders, profileMode: "iraqi" });
      case "team":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(TeamView, { role, allOrders, currentUser: localStorage.getItem("iraqi_auth_username") || role, profileMode: "iraqi", onOrderClick: setSelectedOrder });
      default:
        return null;
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("iraqi_auth_role");
    setRole(null);
  };
  const handleNotificationClick = (orderId, sheetName) => {
    const order = allOrders.find((o) => String(o.id) === orderId && o.sheet_name === sheetName);
    if (order) {
      setSelectedOrder(order);
    } else {
      toast.error("Order not found in currently loaded data. It might be in an older month.");
    }
  };
  if (!role) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LoginView, { onLogin: setRole });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { role, onLogout: handleLogout, onNotificationClick: handleNotificationClick, activeTab, setActiveTab, searchQuery, setSearchQuery, isSearchingAll, onSearchAll: () => setActiveTab("calculator"), onCameraSearch: () => setShowCameraSearch(true), viewingMonth, setViewingMonth, activeYear, setActiveYear, availableMonths, children: /* @__PURE__ */ jsxRuntimeExports.jsx(React__default.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-sm text-muted-foreground", children: "Loading..." }), children: renderContent() }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(React__default.Suspense, { fallback: null, children: [
      selectedOrder && /* @__PURE__ */ jsxRuntimeExports.jsx(
        OrderDetailModal,
        {
          order: selectedOrder,
          onClose: () => setSelectedOrder(null),
          onEdit: (o) => {
            setEditingOrder(o);
            setSelectedOrder(null);
            setActiveTab("new-order");
          },
          onDelete: () => {
            setAllOrders((prev) => prev.filter((o) => {
              const isMain = o.id === selectedOrder.id && o.sheet_name === selectedOrder.sheet_name;
              const isLinked = selectedOrder.linkedOrderIds && selectedOrder.linkedOrderIds.includes(`${o.id}:${o.sheet_name}`);
              const isLinkedLegacy = selectedOrder.linkedOrderIds && selectedOrder.linkedOrderIds.includes(o.id);
              return !(isMain || isLinked || isLinkedLegacy);
            }));
            setSelectedOrder(null);
            setTimeout(() => forceRefreshMonth(viewingMonth), 1e3);
          },
          allOrders,
          onSuccess: (payload) => {
            setSelectedOrder(null);
            if (payload) handleFormSuccess(payload);
            else forceRefreshMonth(viewingMonth);
          },
          onStatusChange: handleStatusChange,
          onUpdateOrder: handleUpdateOrder
        }
      ),
      showCameraSearch && /* @__PURE__ */ jsxRuntimeExports.jsx(CameraSearchModal, { allOrders, onOrderClick: (o) => {
        setShowCameraSearch(false);
        setSelectedOrder(o);
      }, onClose: () => setShowCameraSearch(false) })
    ] })
  ] });
};
function IraqiPage() {
  const [iraqiRole, setIraqiRole] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const kurdRole = localStorage.getItem("auth_role");
    if (kurdRole && kurdRole !== "owner") {
      window.location.href = "/";
      return;
    }
    if (kurdRole === "owner" && !localStorage.getItem("iraqi_auth_role")) {
      localStorage.setItem("iraqi_auth_role", "owner");
      localStorage.setItem("iraqi_auth_username", localStorage.getItem("auth_username") || "owner");
    }
    setIraqiRole(localStorage.getItem("iraqi_auth_role"));
    const onStorage = () => setIraqiRole(localStorage.getItem("iraqi_auth_role"));
    window.addEventListener("storage", onStorage);
    const interval = setInterval(onStorage, 1e3);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "iraqi-theme min-h-screen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Index, {}) });
}
const iraqi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  component: IraqiPage
}, Symbol.toStringTag, { value: "Module" }));
export {
  getCustomerTotalPrice as a,
  getDisplayPrice as b,
  cleanOrderNo as c,
  getLinkedGroup as d,
  getLinkedOrdersInfo as e,
  fetchWithRetry as f,
  getBoxName as g,
  isOrderFree as h,
  iraqi as i,
  sendNotification as s,
  uploadToImgBB as u
};
