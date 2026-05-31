import { j as jsxRuntimeExports, r as reactExports, a as React__default } from "../_libs/react.mjs";
import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { d as distExports } from "../_libs/react-router-dom.mjs";
import { z } from "../_libs/next-themes.mjs";
import { T as Toaster$2, t as toast } from "../_libs/sonner.mjs";
import { Q as useToast, i as YEARS_CONFIG, a as ACTIVE_ORDER_SHEET, b as SCRIPT_URL, D as recordOrderDeleted, t as getOrderStatus, G as GlobalCalculatorButton, j as cn, k as db, T as ThemeColorPicker, h as SystemSwitcher, w as getVerifiedSet, r as getMissingSet, e as STATUS_COLORS, p as getMissingImages, S as SCRIPT_URL$1, E as recordPresence, l as ensureBrowserNotificationPermission, y as normalizeTeamUsername, u as getUserStatsForProfile, c as SOURCE_STYLES, O as showBrowserNotification, I as Input, B as Button, g as STATUS_ROW_COLORS, J as saveMissingImages, L as saveMissingSet, N as saveVerifiedSet, m as fetchCombinedAuthUsers, z as parseOrderPrice, P as storage, F as resolveTeamUsername, C as recordOrderCreated } from "./GlobalCalculator-qKTf8MtO.mjs";
import { P as Provider$1, R as Root2, T as Title, D as Description, C as Close, V as Viewport, A as Action } from "../_libs/radix-ui__react-toast.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { P as Provider, C as Content2 } from "../_libs/radix-ui__react-tooltip.mjs";
import { getDisplayPrice, getLinkedOrdersInfo, getBoxName, cleanOrderNo, isOrderFree, getLinkedGroup, getCustomerTotalPrice, uploadToImgBB } from "./order-utils-fqXvoRHs.mjs";
import { a as fetchWithRetry, s as sendNotification, f as fetchNotifications, b as markNotificationRead, m as markNotificationFixed } from "./notifications-DWkTZayr.mjs";
import { aR as setDoc, a5 as doc, aQ as serverTimestamp, aL as query, b1 as where, U as collection, aD as onSnapshot, aH as orderBy, a1 as deleteDoc, z as addDoc } from "../_libs/firebase__firestore.mjs";
import { S as Scanner } from "../_libs/yudiel__react-qr-scanner.mjs";
import { j as jsQR } from "../_libs/jsqr.mjs";
import { t as toPng } from "../_libs/html-to-image.mjs";
import { T as Tesseract } from "../_libs/tesseract.js.mjs";
import { r as ref, b as uploadBytesResumable, g as getDownloadURL, u as uploadBytes } from "../_libs/firebase__storage.mjs";
import "../_libs/firebase.mjs";
import { a9 as X, a6 as User, u as Lock, t as LoaderCircle, L as LayoutDashboard, Z as ShoppingCart, w as MessageCircle, C as Calculator, a8 as Wallet, P as Package, Q as Plus, a4 as Truck, a7 as Users, a0 as Sun, y as Moon, v as LogOut, M as Menu, i as ChevronLeft, T as Search, e as Camera, a as ArrowLeft, r as Eye, I as Image$1, H as Heart, N as Pen, s as Link2, E as ExternalLink, a1 as Trash2, F as FileText, W as Share2, a3 as TriangleAlert, j as ChevronRight, a5 as Upload, c as Bell, Y as ShieldAlert, g as Check, X as Shield, A as Activity, K as Paperclip, $ as Square, x as Mic, U as Send, m as CircleAlert, B as Banknote, V as Settings, d as Calendar, h as ChevronDown, z as PackagePlus, O as Pencil, p as Copy, n as CircleCheck, k as ChevronUp, q as Download, S as Scan, _ as Sparkles, o as Clock, D as DollarSign, a2 as TrendingUp, b as ArrowRight, R as ScanBarcode, f as CameraOff } from "../_libs/lucide-react.mjs";
import { A as AnimatePresence, m as motion } from "../_libs/framer-motion.mjs";
import { R as ResponsiveContainer, a as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, c as PieChart, P as Pie, b as Cell } from "../_libs/recharts.mjs";
import "../_libs/react-router.mjs";
import "../_libs/@protobufjs/inquire.mjs";
import "../_libs/react-dom.mjs";
import "async_hooks";
import "stream";
import "util";
import "crypto";
import "../_libs/cookie.mjs";
import "../_libs/set-cookie-parser.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
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
import "../_libs/firebase__app.mjs";
import "../_libs/firebase__component.mjs";
import "../_libs/firebase__util.mjs";
import "../_libs/firebase__logger.mjs";
import "../_libs/idb.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
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
import "../_libs/protobufjs__utf8.mjs";
import "../_libs/protobufjs__pool.mjs";
import "../_libs/long.mjs";
import "../_libs/protobufjs__codegen.mjs";
import "../_libs/protobufjs__fetch.mjs";
import "../_libs/protobufjs__path.mjs";
import "http";
import "url";
import "zlib";
import "../_libs/barcode-detector.mjs";
import "../_libs/webrtc-adapter.mjs";
import "../_libs/sdp.mjs";
import "worker_threads";
import "../_libs/regenerator-runtime.mjs";
import "../_libs/node-fetch.mjs";
import "../_libs/whatwg-url.mjs";
import "../_libs/webidl-conversions.mjs";
import "punycode";
import "../_libs/tr46.mjs";
import "https";
import "../_libs/is-url.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
import "../_libs/es-toolkit.mjs";
import "../_libs/reselect.mjs";
import "../_libs/react-is.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/d3-shape.mjs";
import "../_libs/d3-path.mjs";
import "../_libs/reduxjs__toolkit.mjs";
import "../_libs/redux.mjs";
import "../_libs/immer.mjs";
import "../_libs/redux-thunk.mjs";
import "../_libs/react-redux.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/victory-vendor.mjs";
import "../_libs/d3-scale.mjs";
import "../_libs/internmap.mjs";
import "../_libs/d3-array.mjs";
import "../_libs/d3-time-format.mjs";
import "../_libs/d3-time.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-format.mjs";
import "../_libs/decimal.js-light.mjs";
import "../_libs/eventemitter3.mjs";
const Toaster$1 = ({ ...props }) => {
  const { theme = "system" } = z();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$2,
    {
      theme,
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const ToastProvider = Provider$1;
const ToastViewport = reactExports.forwardRef(({ className, ...props }, ref2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Viewport,
  {
    ref: ref2,
    className: cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    ),
    ...props
  }
));
ToastViewport.displayName = Viewport.displayName;
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Toast = reactExports.forwardRef(({ className, variant, ...props }, ref2) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root2, { ref: ref2, className: cn(toastVariants({ variant }), className), ...props });
});
Toast.displayName = Root2.displayName;
const ToastAction = reactExports.forwardRef(({ className, ...props }, ref2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Action,
  {
    ref: ref2,
    className: cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors group-[.destructive]:border-muted/40 hover:bg-secondary group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group-[.destructive]:focus:ring-destructive disabled:pointer-events-none disabled:opacity-50",
      className
    ),
    ...props
  }
));
ToastAction.displayName = Action.displayName;
const ToastClose = reactExports.forwardRef(({ className, ...props }, ref2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Close,
  {
    ref: ref2,
    className: cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-red-300 hover:text-foreground group-[.destructive]:hover:text-red-50 focus:opacity-100 focus:outline-none focus:ring-2 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    ),
    "toast-close": "",
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
  }
));
ToastClose.displayName = Close.displayName;
const ToastTitle = reactExports.forwardRef(({ className, ...props }, ref2) => /* @__PURE__ */ jsxRuntimeExports.jsx(Title, { ref: ref2, className: cn("text-sm font-semibold", className), ...props }));
ToastTitle.displayName = Title.displayName;
const ToastDescription = reactExports.forwardRef(({ className, ...props }, ref2) => /* @__PURE__ */ jsxRuntimeExports.jsx(Description, { ref: ref2, className: cn("text-sm opacity-90", className), ...props }));
ToastDescription.displayName = Description.displayName;
function Toaster() {
  const { toasts } = useToast();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(ToastProvider, { children: [
    toasts.map(function({ id, title, description, action, ...props }) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Toast, { ...props, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1", children: [
          title && /* @__PURE__ */ jsxRuntimeExports.jsx(ToastTitle, { children: title }),
          description && /* @__PURE__ */ jsxRuntimeExports.jsx(ToastDescription, { children: description })
        ] }),
        action,
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToastClose, {})
      ] }, id);
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ToastViewport, {})
  ] });
}
const TooltipProvider = Provider;
const TooltipContent = reactExports.forwardRef(({ className, sideOffset = 4, ...props }, ref2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref: ref2,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
));
TooltipContent.displayName = Content2.displayName;
const COL = "order_updates";
async function broadcastOrderChange(payload, sheet, rowId, action = "upsert") {
  try {
    const key = `${sheet}__${rowId}`;
    await setDoc(doc(db, COL, key), {
      payload,
      sheet,
      row_id: rowId,
      action,
      ts: serverTimestamp(),
      _ms: Date.now()
    }, { merge: true });
  } catch (e) {
    console.warn("broadcastOrderChange failed", e);
  }
}
function subscribeOrderChanges(handler) {
  const since = Date.now() - 5e3;
  const q = query(collection(db, COL), where("_ms", ">=", since));
  const unsub = onSnapshot(q, (snap) => {
    snap.docChanges().forEach((ch) => {
      if (ch.type === "removed") return;
      const d = ch.doc.data();
      if (!d || !d.sheet) return;
      handler({ payload: d.payload, sheet: d.sheet, row_id: d.row_id, action: d.action || "upsert", _ms: d._ms || 0 });
    });
  }, (err) => console.warn("subscribeOrderChanges error", err));
  return unsub;
}
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
      const currentUsername = localStorage.getItem("auth_username") || "";
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
              tag: `notification-${n.id}`
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
  const currentReadKey = localStorage.getItem("auth_username") || role || "";
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
                n.isWarning && n.fixedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 px-3 py-1.5 bg-green-500/10 rounded-lg text-xs font-bold text-green-600 inline-flex items-center gap-1.5", children: [
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
  currentSystem = "kurdistani",
  onSystemChange
}) => {
  const [sidebarOpen, setSidebarOpen] = reactExports.useState(false);
  const [isDark, setIsDark] = reactExports.useState(() => document.documentElement.classList.contains("dark"));
  const [searchExpanded, setSearchExpanded] = reactExports.useState(false);
  const [localSearch, setLocalSearch] = reactExports.useState(searchQuery);
  const [hasUnreadMessages, setHasUnreadMessages] = reactExports.useState(false);
  reactExports.useEffect(() => {
    try {
      const lastReadMap = JSON.parse(localStorage.getItem("messages_last_read") || "{}");
      const allLastReads = Object.values(lastReadMap);
      let isMounted = true;
      import("./GlobalCalculator-qKTf8MtO.mjs").then((n) => n.n).then(({ db: db2 }) => {
        import("../_libs/firebase.mjs").then(({ collection: collection2, query: query2, onSnapshot: onSnapshot2 }) => {
          const q = query2(collection2(db2, "topics"));
          const unsubscribe = onSnapshot2(q, (snapshot) => {
            if (!isMounted) return;
            let unread = false;
            const updatedLastReads = JSON.parse(localStorage.getItem("messages_last_read") || "{}");
            snapshot.docs.forEach((doc2) => {
              const data = doc2.data();
              if (data.lastMessageAt && data.lastMessageAt.toMillis && data.lastMessageAt.toMillis() > (updatedLastReads[doc2.id] || 0)) {
                if (doc2.id.startsWith("dm_")) {
                  const currentUser = localStorage.getItem("auth_username") || role;
                  if (!doc2.id.includes(currentUser.toLowerCase())) return;
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
    const currentUser = localStorage.getItem("auth_username") || role;
    const pingPresence = () => recordPresence("kurdistani", currentUser, role, true).catch(() => {
    });
    const setOffline = () => recordPresence("kurdistani", currentUser, role, false).catch(() => {
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
  const toggleTheme = () => {
    setIsDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };
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
    /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: `fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex flex-col", children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: toggleTheme, className: "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all", children: [
          isDark ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { size: 18 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { size: 18 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isDark ? "Light Mode" : "Dark Mode" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onLogout, className: "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 18 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Sign Out" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col min-w-0 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSidebarOpen(true), className: "lg:hidden relative p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { size: 20 }),
            hasUnreadMessages && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 glow-red ring-2 ring-card" })
          ] }),
          showBack ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveTab("orders"), className: "hidden md:flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 20 }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "hidden md:block text-lg font-bold capitalize whitespace-nowrap", children: activeTab === "new-order" ? "New Order" : activeTab })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 w-full max-w-[180px] sm:max-w-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full group", children: [
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
              className: "w-full bg-secondary border border-border text-foreground text-sm rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
            }
          ),
          localSearch && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setLocalSearch("");
            setSearchQuery?.("");
          }, className: "absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
          isSearchingAll && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden sm:flex flex items-center gap-2 text-xs text-primary font-medium mr-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" }),
            "Loading..."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsDropdown, { role, onNotificationClick }),
          role === "owner" && /* @__PURE__ */ jsxRuntimeExports.jsx(SystemSwitcher, { role, current: currentSystem, onChange: onSystemChange }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeColorPicker, { compact: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onCameraSearch, className: "p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors", title: "Image Search", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 18 }) }),
          role === "owner" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onSearchAll, className: "p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors", title: "Global Ledger", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { size: 18 }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: `flex-1 min-h-0 ${activeTab === "messages" ? "overflow-hidden p-0" : "overflow-y-auto p-4 lg:p-6 custom-scrollbar"}`, children })
    ] })
  ] });
};
const MonthSelector = React__default.memo(({ viewingMonth, setViewingMonth, activeYear, setActiveYear, availableMonths }) => {
  const [openYear, setOpenYear] = reactExports.useState(null);
  const visibleMonths = openYear === activeYear ? availableMonths : [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: Object.keys(YEARS_CONFIG).sort((a, b) => b.localeCompare(a)).map((y) => {
      const handleYearClick = () => {
        setActiveYear(y);
        setOpenYear((prev) => prev === y ? null : y);
      };
      return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleYearClick, className: `px-2 py-1 rounded text-[10px] font-bold transition-all ${activeYear === y ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`, children: y }, y);
    }) }),
    visibleMonths.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 overflow-x-auto no-scrollbar", children: visibleMonths.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewingMonth(m), className: `shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${viewingMonth === m ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`, children: m }, m)) })
  ] });
});
MonthSelector.displayName = "MonthSelector";
const DashboardView = ({
  stats,
  orders,
  viewingMonth,
  availableMonths,
  setViewingMonth,
  setActiveTab,
  setSearchQuery,
  onNewOrder,
  activeYear,
  setActiveYear
}) => {
  const [showFinancials, setShowFinancials] = reactExports.useState(false);
  const [timeframe, setTimeframe] = reactExports.useState("daily");
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => getOrderStatus(o) === "pending").length;
  const pendingInBoxes = orders.filter((o) => getOrderStatus(o) === "pending" && String(o.box_name || "").trim()).length;
  const pendingUnboxed = pendingOrders - pendingInBoxes;
  const uniqueBatches = new Set(orders.map((o) => {
    const box = String(o.box_name || "").trim();
    if (!box) return "";
    const match = box.match(/(\d+)/);
    return match ? match[1] : box;
  }).filter(Boolean));
  const revenue = orders.length > 0 ? orders.reduce((sum, order) => sum + getCustomerTotalPrice(order), 0) : stats?.revenue || 0;
  const buy = stats?.buy || 0;
  const wgt = stats?.wgt || 0;
  const etc = stats?.etc || 0;
  const lost = stats?.lost || 0;
  const totalCost = buy + wgt + etc + lost;
  const profit = revenue - totalCost;
  const margin = revenue > 0 ? profit / revenue * 100 : 0;
  const activityData = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    orders.forEach((order) => {
      if (!order.date || order.date === "Unknown Date") return;
      const parts = order.date.split(" ");
      if (parts.length !== 2) return;
      const [datePart, timePart] = parts;
      const [day, month] = datePart.split("/");
      const [hour] = timePart.split(":");
      let key = "";
      if (timeframe === "weekly") key = `Week ${Math.ceil(parseInt(day, 10) / 7)}`;
      else if (timeframe === "daily") key = `${day}/${month}`;
      else key = `${hour}:00`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.keys()).sort().map((k) => ({ name: k, orders: map.get(k) || 0 }));
  }, [orders, timeframe]);
  const statusData = [
    { name: "Pending", value: pendingOrders, color: "hsl(var(--status-pending))" },
    { name: "Processed", value: totalOrders - pendingOrders, color: "hsl(var(--primary))" }
  ];
  const StatCard = ({ title, value, icon: Icon, sub, onClick }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick, className: "bg-card p-5 rounded-xl border border-border hover:border-primary/30 transition-all text-left w-full group", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 18 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs font-semibold uppercase tracking-wider", children: title })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: value }),
    sub && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase font-medium tracking-wider text-muted-foreground mt-1", children: sub })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 animate-slide-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Financial Overview" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs mt-0.5", children: "Analytics & Performance Metrics" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MonthSelector, { viewingMonth, setViewingMonth, activeYear, setActiveYear, availableMonths }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onNewOrder, className: "flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm transition-colors glow-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
          " New Order"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { title: "Total Orders", value: totalOrders, icon: ShoppingCart, sub: `${viewingMonth} Registry`, onClick: () => {
        setSearchQuery("");
        setActiveTab("orders");
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { title: "Pending", value: pendingOrders, icon: Clock, sub: `📦 ${pendingInBoxes} in boxes · ${pendingUnboxed} unboxed`, onClick: () => {
        setSearchQuery("pending");
        setActiveTab("orders");
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { title: "Active Boxes", value: uniqueBatches.size, icon: Package, sub: "In progress", onClick: () => setActiveTab("batches") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { title: "Revenue", value: `${(revenue / 1e6).toFixed(1)}M`, icon: DollarSign, sub: "Total IQD", onClick: () => setShowFinancials((p) => !p) })
    ] }),
    showFinancials && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-5 rounded-xl border border-border animate-slide-up", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 bg-primary/10 rounded-lg text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { size: 18 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold", children: "Financial Breakdown" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `px-2.5 py-1 rounded-lg text-xs font-semibold ${profit > 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`, children: [
          margin.toFixed(1),
          "% Margin"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary p-4 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-xs font-medium mb-1", children: "Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xl font-bold font-mono", children: [
            revenue.toLocaleString(),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "IQD" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary p-4 rounded-lg space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Buying Cost" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive font-mono font-semibold", children: buy.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Weight/Ship" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive font-mono font-semibold", children: wgt.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Other" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive font-mono font-semibold", children: etc.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Lost" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive font-mono font-semibold", children: lost.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-2 flex justify-between text-xs font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total Cost" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: totalCost.toLocaleString() })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary p-4 rounded-lg flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-xs font-medium mb-1", children: "Net Profit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold font-mono ${profit > 0 ? "text-primary" : "text-destructive"}`, children: profit.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "IQD" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 bg-card p-5 rounded-xl border border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 bg-primary/10 rounded-lg text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 18 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm", children: "Order Activity" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: ["daily", "weekly", "hourly"].map((tf) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTimeframe(tf), className: `px-2.5 py-1 rounded text-[10px] font-semibold uppercase transition-all ${timeframe === tf ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`, children: tf }, tf)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: activityData, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name", tick: { fontSize: 10, fill: "hsl(var(--muted-foreground))" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 10, fill: "hsl(var(--muted-foreground))" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "orders", fill: "hsl(var(--primary))", radius: [4, 4, 0, 0] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-5 rounded-xl border border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm mb-4", children: "Order Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: statusData, cx: "50%", cy: "50%", innerRadius: 50, outerRadius: 80, paddingAngle: 5, dataKey: "value", children: statusData.map((entry, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: entry.color }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 } })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center gap-4 mt-2", children: statusData.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2.5 h-2.5 rounded-full", style: { background: s.color } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            s.name,
            ": ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: s.value })
          ] })
        ] }, s.name)) })
      ] })
    ] })
  ] });
};
function findAutoBoxName(orders, newPieces) {
  const boxMap = /* @__PURE__ */ new Map();
  const closedBoxes = /* @__PURE__ */ new Set();
  orders.forEach((o) => {
    const match = String(o.box_name || "").trim().match(/^Box (\d+)$/);
    if (match) {
      const num = parseInt(match[1]);
      const pieces = Number(o.pics_text) || 0;
      boxMap.set(num, (boxMap.get(num) || 0) + pieces);
      if (getOrderStatus(o) !== "pending") {
        closedBoxes.add(num);
      }
    }
  });
  if (boxMap.size === 0) {
    return "Box 1";
  }
  const maxBoxNum = Math.max(...boxMap.keys());
  const currentBoxPieces = boxMap.get(maxBoxNum) || 0;
  if (closedBoxes.has(maxBoxNum)) {
    return `Box ${maxBoxNum + 1}`;
  }
  if (currentBoxPieces >= 90 || currentBoxPieces + newPieces > 110) {
    return `Box ${maxBoxNum + 1}`;
  }
  return `Box ${maxBoxNum}`;
}
const OrderFormView = ({ activeSheet, editingOrder, onCancel, onSuccess, allOrders }) => {
  const [step, setStep] = reactExports.useState(1);
  const [primaryFiles, setPrimaryFiles] = reactExports.useState([]);
  const [existingPrimaryUrls, setExistingPrimaryUrls] = reactExports.useState([]);
  const [previewPrimaryUrls, setPreviewPrimaryUrls] = reactExports.useState([]);
  const [proofFiles, setProofFiles] = reactExports.useState([]);
  const [existingProofUrls, setExistingProofUrls] = reactExports.useState([]);
  const [previewProofUrls, setPreviewProofUrls] = reactExports.useState([]);
  const [viewingImage, setViewingImage] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState({
    sheet_name: activeSheet,
    insta: "",
    name: "",
    link: "",
    place: "",
    price: "",
    initial_payment: "0",
    phone: "",
    phone2: "",
    pics_text: "1",
    note: "",
    box_cost: "",
    shipping_cost: ""
  });
  const [region, setRegion] = reactExports.useState("");
  const isEditing = !!editingOrder;
  reactExports.useEffect(() => {
    const saved = localStorage.getItem("last_region");
    if (saved && !isEditing) {
      setRegion(saved);
      const isOutsideErbil = saved === "outside_erbil" || saved === "sulaymani" || saved === "duhok" || saved === "kirkuk" || saved === "zaxo";
      const cost = saved === "erbil" ? 3e3 : isOutsideErbil ? 5e3 : saved === "outside_kurdistan" ? 6e3 : 0;
      setFormData((prev) => ({ ...prev, shipping_cost: cost }));
    }
  }, [isEditing]);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [loyaltyCount, setLoyaltyCount] = reactExports.useState(0);
  const [showSuggestions, setShowSuggestions] = reactExports.useState(false);
  const [suggestions, setSuggestions] = reactExports.useState([]);
  const [freeShipping, setFreeShipping] = reactExports.useState(false);
  const [showLinkModal, setShowLinkModal] = reactExports.useState(false);
  const [linkSearch, setLinkSearch] = reactExports.useState("");
  const [linkedIds, setLinkedIds] = reactExports.useState([]);
  const [activeSuggestionField, setActiveSuggestionField] = reactExports.useState("insta");
  const fileRef = reactExports.useRef(null);
  const proofFileRef = reactExports.useRef(null);
  const suggestionContainerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionContainerRef.current && !suggestionContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const customerDb = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    allOrders.forEach((o) => {
      const insta = String(o.insta || "").trim().toLowerCase();
      const name = String(o.name || "").trim().toLowerCase();
      const phone = String(o.phone || "").trim();
      const key = insta || phone || name;
      if (key && !map.has(key)) {
        map.set(key, {
          insta: String(o.insta || ""),
          name: String(o.name || ""),
          phone: String(o.phone || "").split("/")[0].trim(),
          phone2: String(o.phone2 || ""),
          place: String(o.place || ""),
          pics_text: String(o.pics_text || "1")
        });
      }
    });
    return Array.from(map.values());
  }, [allOrders]);
  reactExports.useEffect(() => {
    if (editingOrder) {
      setFormData({
        ...editingOrder,
        price: getDisplayPrice(editingOrder).toString()
      });
      if (isOrderFree(editingOrder)) {
        setFreeShipping(true);
      }
      const formatImg = (img) => {
        if (img.startsWith("http") || img.startsWith("data:")) return img;
        if (img.length > 100) return `data:image/jpeg;base64,${img}`;
        return img;
      };
      let primaryUrlArray = editingOrder.primary_urls ? String(editingOrder.primary_urls).split(",").filter(Boolean) : [];
      primaryUrlArray = primaryUrlArray.map(formatImg);
      setExistingPrimaryUrls(primaryUrlArray);
      let proofUrlArray = [];
      if (editingOrder.proof_urls) {
        proofUrlArray = (Array.isArray(editingOrder.proof_urls) ? editingOrder.proof_urls : String(editingOrder.proof_urls).split(",")).map((s) => String(s).trim()).filter(Boolean);
      }
      if (proofUrlArray.length === 0 && editingOrder.image_url) {
        proofUrlArray = String(editingOrder.image_url).split(",").map((s) => s.trim()).filter(Boolean);
      }
      proofUrlArray = proofUrlArray.map(formatImg);
      setExistingProofUrls(proofUrlArray);
      setLinkedIds((editingOrder.linkedOrderIds || []).filter((id) => typeof id === "string" && String(id).includes(":")));
    } else setFormData((prev) => ({ ...prev, sheet_name: activeSheet }));
  }, [editingOrder, activeSheet]);
  const searchCustomers = (value, field) => {
    const val = value.toLowerCase().trim();
    if (val.length === 0) {
      setShowSuggestions(false);
      return;
    }
    const matches = customerDb.filter((c) => {
      if (field === "insta") return c.insta.toLowerCase().includes(val);
      if (field === "name") return c.name.toLowerCase().includes(val);
      if (field === "phone") return c.phone.includes(val);
      return false;
    });
    const seen = /* @__PURE__ */ new Set();
    const unique = matches.filter((c) => {
      const id = `${c.insta}-${c.name}-${c.phone}`.toLowerCase();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    }).slice(0, 8);
    setSuggestions(unique.map((c) => ({ insta: c.insta, name: c.name, phone: c.phone, phone2: c.phone2, place: c.place, pics_text: c.pics_text })));
    setActiveSuggestionField(field);
    setShowSuggestions(unique.length > 0);
    setLoyaltyCount(allOrders.filter((o) => {
      if (field === "phone") return String(o.phone || "").includes(val);
      return String(o.insta || "").toLowerCase().includes(val) || String(o.name || "").toLowerCase().includes(val);
    }).length);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "region") {
      const r = value;
      setRegion(r);
      localStorage.setItem("last_region", r);
      const isOutsideErbil = r === "outside_erbil" || r === "sulaymani" || r === "duhok" || r === "kirkuk" || r === "zaxo";
      const cost = r === "erbil" ? 3e3 : isOutsideErbil ? 5e3 : r === "outside_kurdistan" ? 6e3 : 0;
      let placePrefix = "";
      if (r === "erbil") placePrefix = "Erbil - ";
      else if (r === "sulaymani") placePrefix = "Sulaymani - ";
      else if (r === "duhok") placePrefix = "Duhok - ";
      else if (r === "kirkuk") placePrefix = "Kirkuk - ";
      else if (r === "zaxo") placePrefix = "Zaxo - ";
      else if (r === "outside_kurdistan") placePrefix = "Iraq - ";
      else if (r === "outside_erbil") placePrefix = "Outside Erbil - ";
      else if (r === "no_location") placePrefix = "No Location - ";
      setFormData((prev) => {
        let currentPlace = String(prev.place || "");
        currentPlace = currentPlace.replace(/^(Erbil|Sulaymani|Duhok|Kirkuk|Zaxo|Iraq|Outside Erbil|No Location)\s*-\s*/i, "");
        return {
          ...prev,
          shipping_cost: cost,
          place: placePrefix + currentPlace
        };
      });
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "insta" || name === "name" || name === "phone") {
      searchCustomers(value, name);
    }
  };
  const selectSuggestion = (s) => {
    const place = String(s.place || "").toLowerCase();
    let derivedRegion = "";
    let shippingCost = 0;
    if (place.includes("no location")) {
      derivedRegion = "no_location";
      shippingCost = 0;
    } else if (place.includes("erbil") || place.includes("hawler") || place.includes("هەولێر")) {
      derivedRegion = "erbil";
      shippingCost = 3e3;
    } else if (place.includes("sulaymani")) {
      derivedRegion = "sulaymani";
      shippingCost = 5e3;
    } else if (place.includes("duhok")) {
      derivedRegion = "duhok";
      shippingCost = 5e3;
    } else if (place.includes("kirkuk")) {
      derivedRegion = "kirkuk";
      shippingCost = 5e3;
    } else if (place.includes("zaxo") || place.includes("zakho")) {
      derivedRegion = "zaxo";
      shippingCost = 5e3;
    } else if (place.includes("halabja") || place.includes("koya") || place.includes("ranya") || place.includes("soran")) {
      derivedRegion = "outside_erbil";
      shippingCost = 5e3;
    } else if (place && !place.includes("erbil")) {
      derivedRegion = "outside_erbil";
      shippingCost = 5e3;
    }
    setFormData((prev) => ({
      ...prev,
      insta: s.insta || prev.insta,
      name: s.name || prev.name,
      place: s.place || prev.place,
      phone: String(s.phone || "").split("/")[0].trim() || prev.phone,
      phone2: s.phone2 || prev.phone2,
      pics_text: s.pics_text || prev.pics_text,
      shipping_cost: shippingCost || prev.shipping_cost
    }));
    if (derivedRegion) setRegion(derivedRegion);
    setShowSuggestions(false);
    setLoyaltyCount(allOrders.filter((o) => String(o.insta || "").toLowerCase().trim() === String(s.insta || "").toLowerCase().trim()).length);
  };
  const [isUploadingImgs, setIsUploadingImgs] = reactExports.useState(false);
  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files) {
      const arrayFiles = Array.from(files);
      const newPreviews = arrayFiles.map((f) => URL.createObjectURL(f));
      setPreviewPrimaryUrls((prev) => [...prev, ...newPreviews]);
      setIsUploadingImgs(true);
      try {
        const uploadedUrls = await Promise.all(arrayFiles.map((f) => uploadToImgBB(f)));
        setExistingPrimaryUrls((prev) => [...prev, ...uploadedUrls]);
        setPreviewPrimaryUrls((prev) => prev.filter((p) => !newPreviews.includes(p)));
      } catch (err) {
        console.error("Image processing failed", err);
      } finally {
        setIsUploadingImgs(false);
      }
    }
  };
  const handleProofFileChange = async (e) => {
    const files = e.target.files;
    if (files) {
      const arrayFiles = Array.from(files);
      const newPreviews = arrayFiles.map((f) => URL.createObjectURL(f));
      setPreviewProofUrls((prev) => [...prev, ...newPreviews]);
      setIsUploadingImgs(true);
      try {
        const uploadedUrls = await Promise.all(arrayFiles.map((f) => uploadToImgBB(f)));
        setExistingProofUrls((prev) => [...prev, ...uploadedUrls]);
        setPreviewProofUrls((prev) => prev.filter((p) => !newPreviews.includes(p)));
      } catch (err) {
        console.error("Image processing failed", err);
      } finally {
        setIsUploadingImgs(false);
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploadingImgs) {
      alert("Pictures are still uploading. Please wait a moment...");
      return;
    }
    if (existingProofUrls.length === 0 && previewProofUrls.length === 0) {
      alert("Proof Picture is required. Please upload at least one proof image.");
      return;
    }
    existingPrimaryUrls.length;
    setIsSubmitting(true);
    try {
      const priceVal = parseFloat(String(formData.price).replace(/[^0-9.-]+/g, "")) || 0;
      const linkedTotal = linkedOrders.reduce((sum, o) => sum + getDisplayPrice(o, allOrders), 0);
      const isAutoFree = priceVal + linkedTotal >= 118e3;
      const anotherOrderIsFree = linkedOrders.some((o) => isOrderFree(o));
      const shouldApplyFree = freeShipping || isAutoFree && !anotherOrderIsFree;
      let cleanExtra = String(formData.extra || "").replace(/\bFree\b/i, "").trim();
      const extraWithFree = shouldApplyFree ? (cleanExtra + (cleanExtra ? " " : "") + "Free").trim() : cleanExtra;
      const cleanNote = String(formData.note || "").replace(/\[ZERO_SHIP\]/gi, "").trim();
      let newBoxNameAttr = formData.box_name || "";
      const pieces = Number(formData.pics_text) || 1;
      const currentMonthOrders = allOrders.filter((o) => o.sheet_name === activeSheet);
      if (!isEditing) {
        newBoxNameAttr = findAutoBoxName(currentMonthOrders, pieces);
      }
      const payload = {
        ...formData,
        price: formData.price,
        box_name: newBoxNameAttr,
        primary_urls: existingPrimaryUrls.join(","),
        proof_urls: existingProofUrls.join(","),
        extra: extraWithFree,
        note: cleanNote,
        linkedOrderIds: linkedIds,
        sheet: isEditing ? formData.sheet_name : activeSheet,
        row_id: isEditing ? editingOrder.id : ""
      };
      if (isEditing) {
        onSuccess(payload);
        fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) }).then(() => {
          if (existingPrimaryUrls.length > 0) {
            return fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({
              action: "update_primary_picture",
              sheet_name: payload.sheet,
              row_id: payload.row_id,
              primary_urls: existingPrimaryUrls.join(",")
            }) });
          }
        }).catch((err) => {
          console.error("Background save failed", err);
        });
        setIsSubmitting(false);
        return;
      }
      const tempId = Date.now();
      const optimisticPayload = { ...payload, row_id: tempId, _tempId: tempId };
      onSuccess(optimisticPayload);
      setIsSubmitting(false);
      if (payload.pics_text || payload.link) {
        try {
          fetch("https://script.google.com/macros/s/AKfycbxUmtYopoO9HznjbfiAP8heZTZlk0RvxtuInPzlEuneNXs4RGAlDvY_FjUAqK8yyT8/exec", {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
              action: "save_order",
              name: String(payload.insta || "Unknown"),
              link: String(payload.link || ""),
              quantity: String(payload.pics_text || "1")
            })
          }).catch(() => {
          });
        } catch (err) {
        }
      }
      (async () => {
        try {
          const res = await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
          const text = await res.text();
          let result;
          try {
            result = JSON.parse(text);
          } catch {
            return;
          }
          if (result?.status === "success") {
            const rowMatch = String(result.message || "").match(/Row (\d+)/);
            const realRowId = rowMatch ? Number(rowMatch[1]) : void 0;
            try {
              const currentRole = localStorage.getItem("auth_role") || "unknown";
              const currentUser = resolveTeamUsername("kurdistani", currentRole);
              await recordOrderCreated("kurdistani", currentUser, currentRole, { ...payload, row_id: realRowId || tempId });
            } catch (e2) {
              console.error("Failed to update user stats", e2);
            }
            if (rowMatch) {
              onSuccess({ ...payload, row_id: realRowId, _tempId: tempId }, result.message);
              if (existingPrimaryUrls.length > 0) {
                fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({
                  action: "update_primary_picture",
                  sheet_name: payload.sheet,
                  row_id: realRowId,
                  primary_urls: existingPrimaryUrls.join(",")
                }) }).catch((err) => console.error("Primary urls save failed", err));
              }
            }
          }
        } catch (err) {
          console.error("Background save failed", err);
        }
      })();
      return;
    } catch (err) {
      console.error("API error", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  const linkableOrders = allOrders.filter((o) => {
    if (editingOrder && o.id === editingOrder.id && o.sheet_name === editingOrder.sheet_name) return false;
    const key = `${o.id}:${o.sheet_name}`;
    if (linkedIds.includes(key) || linkedIds.includes(o.id)) return false;
    const q = linkSearch.toLowerCase();
    if (!q) return true;
    return [o.insta, o.name, o.phone, o.orderNo].some((f) => String(f || "").toLowerCase().includes(q));
  }).slice(0, 15);
  const linkedOrders = allOrders.filter((o) => {
    const key = `${o.id}:${o.sheet_name}`;
    return linkedIds.includes(key) || linkedIds.includes(o.id);
  });
  const inputClass = "w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50";
  const labelClass = "text-xs font-semibold text-muted-foreground uppercase tracking-wider";
  const renderField = (label, fieldName, type = "text", placeholder = "", required = false) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: labelClass, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        name: fieldName,
        value: String(formData[fieldName] || ""),
        onChange: handleInputChange,
        placeholder,
        required,
        onFocus: () => {
          if (["insta", "name", "phone"].includes(fieldName)) {
            const val = String(formData[fieldName] || "");
            if (val) searchCustomers(val, fieldName);
          } else {
            setShowSuggestions(false);
          }
        },
        className: inputClass
      }
    )
  ] });
  const SuggestionsDropdown = () => {
    if (!showSuggestions || suggestions.length === 0) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center px-3 py-1.5 bg-secondary border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wider", children: "Suggestions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowSuggestions(false), className: "p-1 hover:bg-muted text-muted-foreground rounded-full transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 12 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-48 overflow-y-auto", children: suggestions.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => selectSuggestion(s), className: "w-full text-left px-3 py-2.5 hover:bg-secondary transition-colors text-sm border-b border-border/50 last:border-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-primary", children: [
              "@",
              s.insta || "-"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              " — ",
              s.name || "-"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: s.place })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: [
          "📱 ",
          s.phone || "-"
        ] })
      ] }, i)) })
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "max-w-lg mx-auto bg-card p-6 rounded-xl border border-border animate-slide-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg", children: isEditing ? "Edit Order" : "New Order" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-xs", children: [
          "Sheet: ",
          activeSheet
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        loyaltyCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 14 }),
          " ",
          loyaltyCount,
          " orders"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onCancel, className: "p-2 bg-secondary hover:bg-secondary/80 rounded-lg text-muted-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", ref: suggestionContainerRef, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        renderField("Instagram", "insta", "text", "@username", true),
        activeSuggestionField === "insta" && /* @__PURE__ */ jsxRuntimeExports.jsx(SuggestionsDropdown, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          renderField("Name", "name", "text", "Customer name"),
          activeSuggestionField === "name" && /* @__PURE__ */ jsxRuntimeExports.jsx(SuggestionsDropdown, {})
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          renderField("Phone", "phone", "tel", "07xx..."),
          activeSuggestionField === "phone" && /* @__PURE__ */ jsxRuntimeExports.jsx(SuggestionsDropdown, {})
        ] })
      ] }),
      renderField("Link", "link", "text", "Product URL"),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        renderField("Price (IQD)", "price", "number", "0", true),
        renderField("Initial Payment", "initial_payment", "number", "0")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        renderField("SKU Qty", "pics_text", "number", "1"),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: labelClass, children: "Region" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { name: "region", value: region, onChange: handleInputChange, className: inputClass, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select region" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "no_location", children: "No Location (0)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "erbil", children: "Erbil (3,000)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "sulaymani", children: "Sulaymani (5,000)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "duhok", children: "Duhok (5,000)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "kirkuk", children: "Kirkuk (5,000)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "zaxo", children: "Zaxo (5,000)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "outside_erbil", children: "Other Outside Erbil (5,000)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "outside_kurdistan", children: "Outside Kurdistan (6,000)" })
          ] })
        ] })
      ] }),
      renderField("Place", "place", "text", "City / Address"),
      renderField("Phone 2", "phone2", "tel", "Secondary phone"),
      renderField("Notes / Box", "note", "text", "Batch name, notes..."),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border p-4 rounded-xl bg-secondary/10 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-3 flex items-center justify-between", children: [
          "Primary Image ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-normal", children: "Optional" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: fileRef, onChange: handleFileChange, accept: "image/*", multiple: true, className: "hidden" }),
          [...existingPrimaryUrls, ...previewPrimaryUrls].map((img, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-square rounded-lg overflow-hidden border border-border group cursor-pointer", onClick: () => setViewingImage(img), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: img, alt: "Primary", referrerPolicy: "no-referrer", className: "w-full h-full object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow z-10", children: "PRIMARY" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "text-white", size: 24 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: (e) => {
              e.stopPropagation();
              if (i < existingPrimaryUrls.length) {
                setExistingPrimaryUrls((p) => p.filter((_, idx) => idx !== i));
              } else {
                const localIdx = i - existingPrimaryUrls.length;
                setPreviewPrimaryUrls((p) => p.filter((_, idx) => idx !== localIdx));
                setPrimaryFiles((p) => p.filter((_, idx) => idx !== localIdx));
              }
            }, className: "absolute top-1 right-1 p-1.5 bg-destructive text-destructive-foreground rounded-full shadow-md z-10 hover:bg-red-600 active:scale-95", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
          ] }, `prim-${i}`)),
          existingPrimaryUrls.length === 0 && previewPrimaryUrls.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => fileRef.current?.click(), className: "relative aspect-square rounded-lg border-2 border-dashed border-primary/40 flex flex-col justify-center items-center cursor-pointer hover:border-primary transition-all group bg-primary/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 18, className: "text-primary/70 group-hover:text-primary transition-colors mb-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-primary/70 group-hover:text-primary leading-tight text-center px-1", children: "Add Primary Image" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border p-4 rounded-xl bg-secondary/10 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-3 flex items-center justify-between text-primary", children: [
          "Proof Picture ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded uppercase font-bold", children: "Required" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: proofFileRef, onChange: handleProofFileChange, accept: "image/*", multiple: true, className: "hidden" }),
          [...existingProofUrls, ...previewProofUrls].map((img, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-square rounded-lg overflow-hidden border border-border group cursor-pointer", onClick: () => setViewingImage(img), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: img, alt: "Proof", referrerPolicy: "no-referrer", className: "w-full h-full object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1 left-1 bg-primary/80 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow z-10", children: "PROOF" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "text-white", size: 24 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: (e) => {
              e.stopPropagation();
              if (i < existingProofUrls.length) {
                setExistingProofUrls((p) => p.filter((_, idx) => idx !== i));
              } else {
                const localIdx = i - existingProofUrls.length;
                setPreviewProofUrls((p) => p.filter((_, idx) => idx !== localIdx));
                setProofFiles((p) => p.filter((_, idx) => idx !== localIdx));
              }
            }, className: "absolute top-1 right-1 p-1.5 bg-destructive text-destructive-foreground rounded-full shadow-md z-10 hover:bg-red-600 active:scale-95", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
          ] }, `proof-${i}`)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => proofFileRef.current?.click(), className: "relative aspect-square rounded-lg border-2 border-dashed border-primary/40 flex flex-col justify-center items-center cursor-pointer hover:border-primary transition-all group bg-primary/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 18, className: "text-primary/70 group-hover:text-primary transition-colors mb-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-primary/70 group-hover:text-primary leading-tight text-center px-1", children: "Add Proof Image" })
          ] })
        ] })
      ] }),
      region && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-secondary/50 border border-border rounded-lg px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Free Shipping" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Mark this order as having free shipping." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setFreeShipping((prev) => !prev),
            className: `relative w-11 h-6 rounded-full transition-colors ${freeShipping ? "bg-primary" : "bg-muted"}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${freeShipping ? "translate-x-5" : ""}` })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Linked Orders" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowLinkModal(true), className: "flex items-center gap-1 text-xs text-primary font-medium hover:underline", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 12 }),
            " Connect Order"
          ] })
        ] }),
        linkedOrders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: linkedOrders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-secondary px-3 py-2 rounded-lg text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
            o.name || o.insta,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-xs", children: [
              "#",
              o.id,
              " · ",
              o.sheet_name
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setLinkedIds((p) => p.filter((id) => id !== `${o.id}:${o.sheet_name}` && id !== o.id)), className: "text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
        ] }, `${o.id}-${o.sheet_name}`)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/30 border border-primary/20 p-4 rounded-xl space-y-2 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold border-b border-border pb-2 mb-2", children: "Cart Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Item Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            (parseFloat(String(formData.price).replace(/[^0-9.-]+/g, "")) || 0).toLocaleString(),
            " IQD"
          ] })
        ] }),
        linkedOrders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Linked Items (",
            linkedOrders.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            linkedOrders.reduce((sum, o) => sum + getDisplayPrice(o), 0).toLocaleString(),
            " IQD"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm font-medium pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Delivery" }),
          (() => {
            const currentPrice = parseFloat(String(formData.price).replace(/[^0-9.-]+/g, "")) || 0;
            const linkedTotal = linkedOrders.reduce((sum, o) => sum + getDisplayPrice(o), 0);
            const cartTotal = currentPrice + linkedTotal;
            const isAutoFree = cartTotal >= 118e3;
            let baseDelivery = 0;
            if (region === "erbil") baseDelivery = 3e3;
            else if (region === "outside_kurdistan") baseDelivery = 6e3;
            else if (region === "no_location") baseDelivery = 0;
            else if (region) baseDelivery = 5e3;
            if (isAutoFree || freeShipping) {
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary font-bold flex items-center gap-1", children: [
                "0 IQD ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-primary/20 px-1.5 py-0.5 rounded text-[10px] uppercase", children: "Free Delivery Activated" })
              ] });
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              baseDelivery.toLocaleString(),
              " IQD"
            ] });
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-base font-bold pt-2 border-t border-border mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Grand Total" }),
          (() => {
            const currentPrice = parseFloat(String(formData.price).replace(/[^0-9.-]+/g, "")) || 0;
            const linkedTotal = linkedOrders.reduce((sum, o) => sum + getDisplayPrice(o), 0);
            const cartTotal = currentPrice + linkedTotal;
            const isAutoFree = cartTotal >= 118e3;
            let baseDelivery = 0;
            if (region === "erbil") baseDelivery = 3e3;
            else if (region === "outside_kurdistan") baseDelivery = 6e3;
            else if (region === "no_location") baseDelivery = 0;
            else if (region) baseDelivery = 5e3;
            const finalDelivery = isAutoFree || freeShipping ? 0 : baseDelivery;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              (cartTotal + finalDelivery).toLocaleString(),
              " IQD"
            ] });
          })()
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-4 border-t border-border mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onCancel, disabled: isSubmitting, className: "flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 rounded-lg transition-all disabled:opacity-50", children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: isSubmitting || isUploadingImgs, className: "flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all glow-primary disabled:opacity-50 flex items-center justify-center gap-2", children: isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" }),
          " Saving..."
        ] }) : isUploadingImgs ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" }),
          " Uploading Imgs..."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 16 }),
          " ",
          isEditing ? "Update" : "Submit"
        ] }) })
      ] })
    ] }),
    viewingImage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewingImage(null), className: "absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 24 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: viewingImage, alt: "Expanded view", referrerPolicy: "no-referrer", className: "max-w-full max-h-full object-contain rounded-lg" })
    ] }),
    showLinkModal && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-foreground/30 backdrop-blur-sm", onClick: () => setShowLinkModal(false) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border w-full max-w-sm rounded-2xl shadow-2xl relative z-10 animate-slide-up", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border flex justify-between items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold", children: "Connect Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowLinkModal(false), className: "p-1.5 bg-secondary rounded-lg text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: linkSearch, onChange: (e) => setLinkSearch(e.target.value), placeholder: "Search by name, insta, phone...", className: "w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-60 overflow-y-auto space-y-1 custom-scrollbar", children: [
            linkableOrders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
              setLinkedIds((p) => [...p, `${o.id}:${o.sheet_name}`]);
              setShowLinkModal(false);
            }, className: "w-full flex justify-between items-center px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: o.name || o.insta }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground ml-2", children: [
                  "#",
                  o.id,
                  " · ",
                  o.sheet_name
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-mono", children: Number(String(o.price).replace(/[^0-9.-]+/g, "")).toLocaleString() })
            ] }, `${o.id}-${o.sheet_name}`)),
            linkableOrders.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground text-sm py-4", children: "No orders found" })
          ] })
        ] })
      ] })
    ] })
  ] });
};
const SKU_API_URL = "https://script.google.com/macros/s/AKfycbxUmtYopoO9HznjbfiAP8heZTZlk0RvxtuInPzlEuneNXs4RGAlDvY_FjUAqK8yyT8/exec";
const SkuSearch = ({ orders, onFound }) => {
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const [skuQuery, setSkuQuery] = reactExports.useState("");
  const [isSearching, setIsSearching] = reactExports.useState(false);
  const [apiResults, setApiResults] = reactExports.useState([]);
  const timeoutRef = reactExports.useRef(null);
  const inputRef = reactExports.useRef(null);
  const containerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  reactExports.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);
  reactExports.useEffect(() => {
    if (!skuQuery.trim() || !isOpen) {
      setApiResults([]);
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      const q = skuQuery.trim().toLowerCase();
      setIsSearching(true);
      setApiResults([]);
      try {
        const url = `${SKU_API_URL}?query=${encodeURIComponent(q)}`;
        const res = await fetchWithRetry(url, { method: "GET" });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.warn("Invalid JSON:", text.substring(0, 50));
          data = null;
        }
        if (data && data.status === "success" && data.results && data.results.length > 0) {
          setApiResults(data.results);
        }
      } catch (err) {
        console.error("SKU Search error", err);
      } finally {
        setIsSearching(false);
      }
    }, 50);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [skuQuery, isOpen]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", ref: containerRef, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setIsOpen(true),
        className: "p-2 rounded-lg transition-all border bg-transparent border-transparent hover:bg-secondary text-muted-foreground",
        title: "Fast SKU Search",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScanBarcode, { size: 16 })
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 sm:hidden", onClick: () => setIsOpen(false) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed left-4 right-4 top-24 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-lg flex items-center gap-2 text-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ScanBarcode, { size: 18, className: "text-primary" }),
            "SKU Search"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsOpen(false), className: "p-1.5 text-muted-foreground hover:bg-secondary rounded-lg transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 16, className: "absolute left-3 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: inputRef,
              type: "text",
              placeholder: "Search SKU or Link...",
              value: skuQuery,
              onChange: (e) => setSkuQuery(e.target.value),
              className: "w-full bg-secondary border border-border text-foreground rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:border-primary/50 transition-colors",
              autoComplete: "off"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-3 flex items-center", children: isSearching ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin text-primary" }) : skuQuery ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setSkuQuery("");
                setApiResults([]);
                inputRef.current?.focus();
              },
              className: "p-1.5 hover:bg-muted text-muted-foreground rounded-full transition-colors",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 })
            }
          ) : null })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[60vh] overflow-y-auto space-y-3", children: [
          apiResults.length > 0 && apiResults.map((result, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-secondary/50 border border-border rounded-lg space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-base", children: result.name || "Unknown Customer" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-0.5", children: [
                  result.quantity || result.pcs || 0,
                  " pieces"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-end gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[10px] bg-green-500/10 text-green-600 px-2 py-1 rounded font-bold uppercase tracking-wider", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12 }),
                "Match Found"
              ] }) })
            ] }),
            result.link && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: result.link,
                target: "_blank",
                rel: "noreferrer",
                className: "mt-3 flex justify-center items-center gap-1.5 w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold rounded-lg transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 16 }),
                  " View Product"
                ]
              }
            )
          ] }, idx)),
          apiResults.length === 0 && !isSearching && skuQuery.trim() && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-8 text-center text-sm text-muted-foreground", children: "No matching SKU or Link found." }),
          !skuQuery.trim() && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-8 text-center text-sm text-muted-foreground opacity-70", children: "Type the SKU or Link to search the external database." })
        ] })
      ] })
    ] })
  ] });
};
const QRScannerModal = ({ onScan, onClose }) => {
  const [error, setError] = reactExports.useState(null);
  const [hasCamera, setHasCamera] = reactExports.useState(null);
  const fileInputRef = reactExports.useRef(null);
  React__default.useEffect(() => {
    let mounted = true;
    async function checkCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          if (mounted) {
            setError("Your browser does not support camera access or it is blocked.");
            setHasCamera(false);
          }
          return;
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === "videoinput");
        if (mounted) {
          if (videoDevices.length > 0) {
            setHasCamera(true);
          } else {
            setError("No camera found. Please ensure your device has a camera.");
            setHasCamera(false);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(`Camera check failed: ${err instanceof Error ? err.message : String(err)}`);
          setHasCamera(false);
        }
      }
    }
    checkCamera();
    return () => {
      mounted = false;
    };
  }, []);
  const [manualInput, setManualInput] = reactExports.useState("");
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const tryDecode = (scale) => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          if (!ctx) return null;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          return jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth"
          });
        };
        let code = tryDecode(1);
        if (!code && img.width > 800) code = tryDecode(0.5);
        if (!code && img.width > 1600) code = tryDecode(0.25);
        if (!code) code = tryDecode(2);
        if (code) {
          onScan(code.data);
        } else {
          setError("No QR code found in the image. Please try again or use a clearer image.");
        }
      };
      img.src = e.target?.result;
    };
    reader.readAsDataURL(file);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-center items-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl overflow-hidden relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border flex justify-between items-center bg-secondary/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg text-foreground", children: "Scan Order QR" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-1.5 text-muted-foreground hover:bg-secondary rounded-lg transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-black relative aspect-square flex items-center justify-center", children: error ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-white flex flex-col items-center gap-3 p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CameraOff, { size: 48, className: "text-red-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setError(null);
              setHasCamera(true);
            },
            className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90",
            children: "Retry Camera"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => fileInputRef.current?.click(),
            className: "px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 16 }),
              " Upload Image"
            ]
          }
        )
      ] })
    ] }) : hasCamera === null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-white flex flex-col items-center gap-3 p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Checking camera..." })
    ] }) : hasCamera ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Scanner,
        {
          onScan: (result) => {
            if (result && result.length > 0) {
              onScan(result[0].rawValue);
            }
          },
          onError: (err) => {
            const msg = typeof err === "string" ? err : err instanceof Error ? err.message : String(err);
            if (msg.includes("NotAllowedError") || msg.includes("Permission denied")) {
              setError("Camera permission denied. Please allow camera access.");
            } else if (msg.includes("NotFoundError") || msg.includes("Requested device not found") || msg.includes("device not found")) {
              setError("No camera found. Please ensure your device has a camera.");
            } else if (msg.includes("NotReadableError") || msg.includes("Could not start video source")) {
              setError("Camera is in use by another application or could not be started.");
            } else {
              setError(`Camera access error: ${msg}`);
            }
            setHasCamera(false);
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none border-[40px] border-black/40" })
    ] }) : null }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 text-center text-sm text-muted-foreground bg-secondary/30 flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: error ? "Scanner unavailable." : "Position the QR code within the frame" }),
      !error && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => fileInputRef.current?.click(),
          className: "px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 flex items-center justify-center gap-2 mx-auto",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 16 }),
            " Upload Image Instead"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 w-full mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: manualInput,
            onChange: (e) => setManualInput(e.target.value),
            placeholder: "Paste QR data or type exact ID...",
            className: "flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50",
            onKeyDown: (e) => {
              if (e.key === "Enter" && manualInput.trim()) {
                onScan(manualInput);
              }
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              if (manualInput.trim()) onScan(manualInput);
            },
            className: "bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors",
            children: "Scan"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "file",
          accept: "image/*",
          className: "hidden",
          ref: fileInputRef,
          onChange: handleImageUpload
        }
      )
    ] })
  ] }) });
};
const getPrimaryImg = (order) => {
  const urls = String(order.primary_urls || "").split(",").filter(Boolean);
  if (urls.length > 0) {
    if (urls[0].startsWith("http") || urls[0].startsWith("data:")) return urls[0];
    if (urls[0].length > 100) return `data:image/jpeg;base64,${urls[0]}`;
  }
  return null;
};
const OrderListView = ({ orders, onEdit, onDelete, onOrderClick, allOrders, viewingMonth, setViewingMonth, activeYear, setActiveYear, availableMonths, onStatusChange, role, onNewOrder, isDeliveryTab, onUpdateOrder }) => {
  const [viewMode, setViewMode] = reactExports.useState("table");
  const [generatingPdf, setGeneratingPdf] = reactExports.useState(null);
  const [verifiedOrders, setVerifiedOrders] = reactExports.useState(getVerifiedSet);
  const [missingOrders, setMissingOrders] = reactExports.useState(getMissingSet);
  const [expandedGroups, setExpandedGroups] = reactExports.useState(/* @__PURE__ */ new Set());
  const [isSelectMode, setIsSelectMode] = reactExports.useState(false);
  const [selectedOrders, setSelectedOrders] = reactExports.useState(/* @__PURE__ */ new Set());
  const [isLinking, setIsLinking] = reactExports.useState(false);
  const [missingImages, setMissingImages] = reactExports.useState(getMissingImages);
  const fileRef = reactExports.useRef(null);
  const [pendingMissingKey, setPendingMissingKey] = reactExports.useState(null);
  const [pendingMissingOrder, setPendingMissingOrder] = reactExports.useState(null);
  const [isUploadingMissing, setIsUploadingMissing] = reactExports.useState(false);
  const [viewImageModal, setViewImageModal] = reactExports.useState(null);
  const [showQRScanner, setShowQRScanner] = reactExports.useState(false);
  const [isProcessingQR, setIsProcessingQR] = reactExports.useState(false);
  const handleManualDelivery = async () => {
    const input = window.prompt("Enter Order ID, Shein Order No, Phone, or Instagram handle to mark as delivered:");
    if (!input || !input.trim()) return;
    const match = input.trim().toLowerCase();
    const foundOrder = allOrders.find(
      (o) => String(o.orderNo).toLowerCase() === match || String(o.id) === match || String(o.phone) === match || String(o.insta).toLowerCase() === match
    );
    if (!foundOrder) {
      alert(`Order not found for entry: ${input}`);
      return;
    }
    if (role === "owner") {
      const confirmOrange = window.confirm(`Confirm delivery for ${foundOrder.name || foundOrder.insta || "Order"}? This will turn row orange.`);
      if (confirmOrange) {
        ({
          sheet: foundOrder.sheet_name,
          row_id: foundOrder.id,
          extra: `[DELIVERY_SCANNED] ${foundOrder.extra || ""}`.trim()
        });
        onStatusChange(foundOrder, "DELIVERY_SCANNED");
        alert("Delivery Confirmed and cell highlighted!");
      }
    } else {
      const confirmScan = window.confirm(`Scan order ${foundOrder.name || match} for delivery?`);
      if (confirmScan) {
        const payload = {
          sheet: foundOrder.sheet_name,
          row_id: foundOrder.id,
          note: `[DELIVERY_SCANNED] ${foundOrder.note || ""}`.trim()
        };
        onStatusChange({ ...foundOrder, note: payload.note }, "arrived");
        alert("Marked as Delivery Scanned, waiting for owner confirmation.");
      }
    }
  };
  const handleQRScan = async (scannedText) => {
    setShowQRScanner(false);
    setIsProcessingQR(true);
    try {
      const match = scannedText.trim();
      let parsedOrderId = null;
      let parsedSheetName = null;
      let isDetailedQR = false;
      try {
        const obj = JSON.parse(match);
        if (obj.orderNo) parsedOrderId = String(obj.orderNo);
        if (obj.id) parsedOrderId = String(obj.id);
        if (obj.sheet_name) {
          parsedSheetName = String(obj.sheet_name);
          isDetailedQR = true;
        }
      } catch (e) {
      }
      const foundOrder = allOrders.find((o) => {
        if (parsedOrderId && parsedSheetName) {
          return String(o.id) === parsedOrderId && String(o.sheet_name) === parsedSheetName;
        }
        return String(o.orderNo) === match || String(o.id) === match || String(o.phone) === match || `${o.id}-${o.sheet_name}` === match || parsedOrderId && (String(o.orderNo) === parsedOrderId || String(o.id) === parsedOrderId);
      });
      if (!foundOrder) {
        alert(`Order not found for QR code: ${match.substring(0, 50)}${match.length > 50 ? "..." : ""}`);
        return;
      }
      if (role === "owner") {
        const confirmOrange = isDetailedQR || window.confirm(`Confirm delivery for ${foundOrder.name || "Order"}? This will turn row orange.`);
        if (confirmOrange) {
          const payload = {
            action: "update",
            row_id: foundOrder.id,
            sheet: foundOrder.sheet_name,
            color_orange: true,
            note: ((foundOrder.note || "").replace(/\[DELIVERY_SCANNED\]/g, "") + " [DELIVERY_CONFIRMED]").trim()
          };
          await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
          alert("Delivery Confirmed and cell highlighted!");
        }
      } else {
        const confirmScan = isDetailedQR || window.confirm(`Scan order ${foundOrder.name || match} for delivery?`);
        if (confirmScan) {
          const payload = {
            action: "update",
            row_id: foundOrder.id,
            sheet: foundOrder.sheet_name,
            note: ((foundOrder.note || "") + " [DELIVERY_SCANNED]").trim()
          };
          await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
          alert("Order scanned for delivery!");
        }
      }
    } catch (e) {
      alert("Error updating order");
    } finally {
      setIsProcessingQR(false);
    }
  };
  const handleOwnerConfirmDelivery = async (order, e) => {
    e.stopPropagation();
    const confirmOrange = window.confirm(`Confirm delivery for ${order.name || "Order"}? This will turn row orange.`);
    if (confirmOrange) {
      try {
        const payload = {
          action: "update",
          row_id: order.id,
          sheet: order.sheet_name,
          color_orange: true,
          note: ((order.note || "").replace(/\[DELIVERY_SCANNED\]/g, "") + " [DELIVERY_CONFIRMED]").trim()
        };
        await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
        alert("Delivery Confirmed and cell highlighted! Refresh manually to see changes.");
      } catch (err) {
        alert("Error updating order");
      }
    }
  };
  const handleBoxNameChange = async (order, e) => {
    e.stopPropagation();
    const currentBox = getBoxName(order);
    const newBox = window.prompt(`Change Box Name for ${order.name || order.insta || "this order"}:`, currentBox);
    if (newBox !== null && newBox.trim() !== currentBox) {
      const trimmed = newBox.trim();
      try {
        await fetchWithRetry(SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({
            action: "update_box_name",
            row_id: order.id,
            sheet: order.sheet_name,
            box_name: trimmed
          })
        });
        order.box_name = trimmed;
      } catch (err) {
        alert("Failed to update box name");
      }
    }
  };
  const groupedOrders = reactExports.useMemo(() => {
    return orders.map((order) => {
      const key = `${order.id}-${order.sheet_name}`;
      return {
        baseOrder: order,
        linkedOrders: [],
        // No visual grouping from now on
        key,
        isGroup: false
      };
    });
  }, [orders]);
  const handleVerify = (order, e) => {
    e.stopPropagation();
    const key = `${order.id}-${order.sheet_name}`;
    const next = new Set(verifiedOrders);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setVerifiedOrders(next);
    saveVerifiedSet(next);
    fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "verifyOrder", row_id: order.id, sheet_name: order.sheet_name, matchStatus: next.has(key) ? "match" : "mismatch" }) }).catch(() => {
    });
  };
  const toggleSelect = (order, e) => {
    e.stopPropagation();
    const key = `${order.id}-${order.sheet_name}`;
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const handleLinkOrders = async () => {
    if (selectedOrders.size < 2) return;
    setIsLinking(true);
    const selectedObjArray = orders.filter((o) => selectedOrders.has(`${o.id}-${o.sheet_name}`));
    if (selectedObjArray.length === 0) {
      setIsLinking(false);
      return;
    }
    const sheetName = selectedObjArray[0].sheet_name;
    const rowIds = selectedObjArray.map((o) => o.id);
    try {
      await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "merge_buying_price",
          sheet_name: sheetName,
          row_ids: rowIds
        })
      });
      setSelectedOrders(/* @__PURE__ */ new Set());
      setIsSelectMode(false);
      alert("Orders linked successfully. The system will sync the latest data automatically.");
    } catch (e) {
      alert("Failed to link orders.");
    } finally {
      setIsLinking(false);
    }
  };
  const handleMissingClick = (order, e) => {
    e.stopPropagation();
    const key = `${order.id}-${order.sheet_name}`;
    if (order.warningBase64 || order.warningImageUrl || missingImages[key]) {
      setViewImageModal(key);
    } else {
      setPendingMissingOrder(order);
      setPendingMissingKey(key);
      fileRef.current?.click();
    }
  };
  const toggleMissing = (order, key, isMissing, warningImageUrl) => {
    const next = new Set(missingOrders);
    if (isMissing) next.add(key);
    else next.delete(key);
    setMissingOrders(next);
    saveMissingSet(next);
    if (!isMissing) {
      if (missingImages[key]) {
        const nextImages = { ...missingImages };
        delete nextImages[key];
        setMissingImages(nextImages);
        saveMissingImages(nextImages);
      }
      if (onUpdateOrder) {
        onUpdateOrder(order.id, order.sheet_name, { warningBase64: void 0, warningImageUrl: void 0 });
      }
      fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "update_warning_picture",
          row_id: order.id,
          sheet_name: order.sheet_name,
          image_url: ""
        })
      }).catch(() => {
      });
      fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "remove_warning_notification", row_id: order.id, sheet_name: order.sheet_name })
      }).catch(() => {
      });
    }
    if (isMissing && warningImageUrl) {
      sendNotification("warning", `WARNING added to order: ${order.name || order.insta}. Please check!`, role ?? null, order, true);
      fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "update_warning_picture",
          row_id: order.id,
          sheet_name: order.sheet_name,
          image_url: warningImageUrl
        })
      }).catch(() => {
      });
    }
    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "markMissing",
        row_id: order.id,
        sheet_name: order.sheet_name,
        missing: isMissing
      })
    }).catch(() => {
    });
  };
  const handleMissingImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !pendingMissingKey || !pendingMissingOrder) {
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setIsUploadingMissing(true);
    try {
      const { uploadToImgBB: uploadToImgBB2 } = await import("./order-utils-fqXvoRHs.mjs");
      const url = await uploadToImgBB2(file);
      const newImages = { ...missingImages, [pendingMissingKey]: url };
      setMissingImages(newImages);
      saveMissingImages(newImages);
      toggleMissing(pendingMissingOrder, pendingMissingKey, true, url);
    } catch (err) {
      alert("Failed to upload missing image");
    } finally {
      setIsUploadingMissing(false);
      setPendingMissingKey(null);
      setPendingMissingOrder(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  if (orders.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      !isDeliveryTab && /* @__PURE__ */ jsxRuntimeExports.jsx(MonthSelector, { viewingMonth, setViewingMonth, activeYear, setActiveYear, availableMonths }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-20 text-center animate-fade-in space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl opacity-30", children: "📦" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-medium", children: "No orders found" }),
        !isDeliveryTab && onNewOrder && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onNewOrder, className: "inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
          "Add First Order"
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-slide-up space-y-3", children: [
    !isDeliveryTab && /* @__PURE__ */ jsxRuntimeExports.jsx(MonthSelector, { viewingMonth, setViewingMonth, activeYear, setActiveYear, availableMonths }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewMode("table"), className: `p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 16 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewMode("gallery"), className: `p-2 rounded-lg transition-all ${viewMode === "gallery" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 16 }) }),
        !isDeliveryTab && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setIsSelectMode(!isSelectMode);
          setSelectedOrders(/* @__PURE__ */ new Set());
        }, className: `p-2 rounded-lg transition-all ml-1 border ${isSelectMode ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:bg-secondary"}`, title: "Select mode for linking orders", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 16 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-muted-foreground mr-2", children: [
          orders.length,
          " orders"
        ] }),
        isDeliveryTab && (role === "owner" || role === "admin") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowQRScanner(true), className: "flex items-center justify-center p-1.5 rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-all border border-orange-200", title: "Scan QR Code", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Scan, { size: 18 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleManualDelivery, className: "flex items-center gap-1.5 bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-700 transition-all shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Add Delivery" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "Add" })
          ] })
        ] }),
        !isDeliveryTab && /* @__PURE__ */ jsxRuntimeExports.jsx(SkuSearch, { orders: allOrders, onFound: onOrderClick }),
        !isDeliveryTab && onNewOrder && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onNewOrder, className: "flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "New Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "New" })
        ] })
      ] })
    ] }),
    viewMode === "gallery" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3", children: groupedOrders.map((group) => {
      const order = group.baseOrder;
      const boxName = getBoxName(order);
      const key = group.key;
      const isVerified = verifiedOrders.has(key);
      const isMissing = missingOrders.has(key) || !!order.warningBase64 || !!order.warningImageUrl;
      const status = getOrderStatus(order);
      const individualPrice = getCustomerTotalPrice(order);
      const isFree = isOrderFree(order);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(React__default.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          onClick: (e) => {
            if (isSelectMode) {
              toggleSelect(order, e);
              return;
            }
            onOrderClick(order);
          },
          className: `bg-card border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group/card ${selectedOrders.has(key) ? "border-primary ring-2 ring-primary/50" : isVerified ? "border-primary/30 ring-1 ring-primary/20" : isMissing ? "border-amber-400/30 ring-1 ring-amber-400/20" : "border-border"} ${STATUS_ROW_COLORS[status]}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square bg-secondary flex items-center justify-center overflow-hidden relative", children: [
              getPrimaryImg(order) ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: getPrimaryImg(order), alt: "", referrerPolicy: "no-referrer", className: "w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500", onError: (e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement?.classList.add("bg-green-500/20");
              } }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full bg-green-500/20 flex flex-col items-center justify-center text-green-700/50 group-hover/card:bg-green-500/30 transition-colors", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { size: 24, className: "mb-1 opacity-50" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold opacity-70", children: "No Image" })
              ] }),
              isSelectMode && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 right-2 w-5 h-5 rounded-full border-2 border-primary bg-background flex items-center justify-center", children: selectedOrders.has(key) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 rounded-full bg-primary" }) }),
              !isSelectMode && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { onClick: (e) => handleMissingClick(order, e), className: `absolute top-1 left-1 p-1 rounded-full cursor-pointer hover:scale-110 transition-transform ${isMissing ? "bg-amber-400 text-white shadow-md" : "bg-background/80 backdrop-blur-sm text-amber-500/70 hover:bg-amber-400 hover:text-white"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 10 }) }),
              !isSelectMode && isVerified && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1 right-1 p-1 bg-primary rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { size: 10, className: "text-primary-foreground", fill: "currentColor" }) }),
              !isDeliveryTab && order.linkedOrderIds && order.linkedOrderIds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1 right-1 bg-background/80 backdrop-blur rounded p-1 flex items-center gap-1 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 12, className: "text-primary" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-1 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm truncate", children: order.name || order.insta }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary font-bold text-sm whitespace-nowrap", children: [
                    individualPrice.toLocaleString(),
                    " IQD"
                  ] }),
                  isFree && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-green-500/20 text-green-600 px-1 rounded font-bold uppercase mt-0.5", children: "Free Ship" })
                ] })
              ] }),
              order.link && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: String(order.link).startsWith("http") ? order.link : `https://${order.link}`, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-[10px] bg-primary/10 hover:bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium transition-colors", onClick: (e) => e.stopPropagation(), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 10 }),
                " Product Link"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: order.place || "-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-1 py-0.5 rounded text-[10px] font-semibold border ${STATUS_COLORS[status]}`, children: status })
              ] }),
              order.note && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded truncate", title: order.note, children: [
                "Note: ",
                order.note
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: (e) => handleBoxNameChange(order, e), className: "mt-1 text-xs text-primary font-medium truncate cursor-pointer hover:underline flex items-center group", children: [
                "📦 ",
                boxName ? `Box ${boxName}` : "Add Box Name",
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 10, className: "ml-1 opacity-0 group-hover:opacity-100 transition-opacity" })
              ] }),
              role === "owner" && String(order.note || "").includes("[DELIVERY_SCANNED]") && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleOwnerConfirmDelivery(order, e), className: "mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 rounded-lg text-xs transition-colors shadow-sm", children: "Confirm Delivery" })
            ] })
          ]
        }
      ) }, key);
    }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card rounded-xl border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: groupedOrders.map((group) => {
      const order = group.baseOrder;
      const status = getOrderStatus(order);
      const individualPrice = getCustomerTotalPrice(order);
      const isFree = isOrderFree(order);
      const initial = parseFloat(String(order.initial_payment).replace(/[^0-9.-]+/g, "")) || 0;
      const remaining = individualPrice - initial;
      const boxName = getBoxName(order);
      const key = group.key;
      const isVerified = verifiedOrders.has(key);
      const isMissing = missingOrders.has(key) || !!order.warningBase64 || !!order.warningImageUrl;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(React__default.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `p-2 sm:p-2.5 flex items-center gap-2 transition-colors cursor-pointer active:scale-[0.98] ${selectedOrders.has(key) ? "bg-primary/10" : isVerified ? "bg-primary/5" : isMissing ? "bg-amber-50 dark:bg-amber-500/5" : ""} ${STATUS_ROW_COLORS[status]}`,
          onClick: (e) => {
            if (isSelectMode) {
              toggleSelect(order, e);
              return;
            }
            onOrderClick(order);
          },
          children: [
            isSelectMode ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 w-4 h-4 rounded-full border border-primary flex items-center justify-center bg-background", children: selectedOrders.has(key) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-primary" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleMissingClick(order, e), className: `shrink-0 w-4 h-4 rounded flex items-center justify-center transition-all ${isMissing ? "bg-amber-400 text-white" : "bg-secondary text-muted-foreground hover:text-amber-500"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 10 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden border border-border relative", children: [
              getPrimaryImg(order) ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: getPrimaryImg(order), alt: "", referrerPolicy: "no-referrer", className: "w-full h-full object-cover", onError: (e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement?.classList.add("bg-green-500/20");
              } }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full bg-green-500/20 flex items-center justify-center text-green-700/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { size: 16, className: "opacity-70" }) }),
              !isDeliveryTab && order.linkedOrderIds && order.linkedOrderIds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-1 -right-1 bg-background rounded-tl p-0.5 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 10, className: "text-primary" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 pr-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-[14px] sm:text-[15px] leading-tight mb-0.5 truncate", children: [
                "@",
                order.insta || "Unknown"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-wrap mb-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-1.5 py-0 rounded text-[9px] font-semibold border ${STATUS_COLORS[status]}`, children: status }),
                boxName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { onClick: (e) => handleBoxNameChange(order, e), className: "px-1.5 py-0 rounded text-[9px] font-semibold border bg-primary/10 text-primary border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors", children: [
                  "📦 Box ",
                  boxName
                ] }),
                isFree && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0 rounded text-[9px] font-bold text-green-600 bg-green-500/20 uppercase", children: "Free" }),
                order.note && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] sm:text-[10px] font-medium text-muted-foreground bg-secondary/50 px-1 py-0 rounded truncate max-w-[100px]", children: [
                  "Notes: ",
                  order.note
                ] }),
                !isDeliveryTab && order.sku && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] bg-secondary/50 px-1 py-0 rounded font-mono text-muted-foreground", children: [
                  "SKU: ",
                  order.sku
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] sm:text-[11px] text-muted-foreground leading-tight truncate", children: [
                order.date ? order.date : order.orderNo ? `#${cleanOrderNo(order.orderNo)}` : "#Pending",
                " · ",
                order.sheet_name
              ] }),
              role === "owner" && String(order.note || "").includes("[DELIVERY_SCANNED]") && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleOwnerConfirmDelivery(order, e), className: "mt-1 w-full max-w-[120px] bg-orange-500 hover:bg-orange-600 text-white font-bold py-0.5 px-2 rounded-lg text-[9px] text-center transition-colors shadow-sm", children: "Confirm Delivery" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 sm:gap-3 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center gap-1.5", children: [
                order.link && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: String(order.link).startsWith("http") ? order.link : `https://${order.link}`, target: "_blank", rel: "noopener noreferrer", className: "text-muted-foreground hover:text-primary transition-colors flex items-center justify-center", onClick: (e) => e.stopPropagation(), title: "Product Link", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 12 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: status, onChange: (e) => {
                  e.stopPropagation();
                  onStatusChange(order, e.target.value);
                }, className: "bg-transparent text-[11px] border-none focus:outline-none text-muted-foreground cursor-pointer w-4 appearance-none text-center p-0 m-0 leading-none", onClick: (e) => e.stopPropagation(), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pending", children: "⏳" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "approved", children: "✅" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "arrived", children: "📦" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cancelled", children: "❌" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleVerify(order, e), className: `transition-all flex items-center justify-center ${isVerified ? "text-primary" : "text-muted-foreground hover:text-primary"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { size: 12, fill: isVerified ? "currentColor" : "none" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end justify-center min-w-[55px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-[14px] sm:text-[15px] leading-none tracking-tight", children: individualPrice.toLocaleString() }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-[10px] font-bold mt-1 tracking-tight ${remaining > 0 ? "text-amber-500" : "text-primary"}`, children: remaining > 0 ? `${remaining.toLocaleString()} due` : "✅ Paid" })
              ] })
            ] })
          ]
        }
      ) }, `${key}-m`);
    }) }) }),
    isSelectMode && selectedOrders.size > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed bottom-6 left-1/2 -translate-x-1/2 pr-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-xl flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium whitespace-nowrap", children: [
        selectedOrders.size,
        " orders selected"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          disabled: isLinking,
          onClick: handleLinkOrders,
          className: "bg-background text-primary px-4 py-1.5 rounded-full font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap",
          children: isLinking ? "Linking..." : "Link Orders"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        setIsSelectMode(false);
        setSelectedOrders(/* @__PURE__ */ new Set());
      }, className: "p-1 hover:bg-background/20 rounded-full transition-colors ml-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 20, className: "rotate-45" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: fileRef, accept: "image/*", className: "hidden", onChange: handleMissingImageChange }),
    isUploadingMissing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-6 rounded-2xl shadow-xl border border-border flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin text-amber-500", size: 32 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-sm", children: "Uploading Warning Image..." })
    ] }) }),
    viewImageModal && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-[150] flex flex-col items-center justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/80 backdrop-blur-sm", onClick: () => setViewImageModal(null) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 p-4 max-h-screen flex flex-col items-center max-w-2xl w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewImageModal(null), className: "absolute -top-12 right-0 p-2 text-white hover:text-amber-400 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 28 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-secondary/50 p-2 rounded-xl border border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: orders.find((o) => `${o.id}-${o.sheet_name}` === viewImageModal)?.warningBase64 || orders.find((o) => `${o.id}-${o.sheet_name}` === viewImageModal)?.warningImageUrl || missingImages[viewImageModal], alt: "Warning", referrerPolicy: "no-referrer", className: "max-w-full max-h-[70vh] object-contain rounded-lg" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 flex gap-4 w-full justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          const keyToDel = viewImageModal;
          setViewImageModal(null);
          const orderO = orders.find((o) => `${o.id}-${o.sheet_name}` === keyToDel);
          if (orderO) {
            toggleMissing(orderO, keyToDel, false);
            if (onUpdateOrder) {
              onUpdateOrder(orderO.id, orderO.sheet_name, { warningBase64: void 0, warningImageUrl: void 0 });
            }
          }
        }, className: "px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18 }),
          "Unmark Warning"
        ] }) })
      ] })
    ] }),
    showQRScanner && /* @__PURE__ */ jsxRuntimeExports.jsx(QRScannerModal, { onScan: handleQRScan, onClose: () => setShowQRScanner(false) })
  ] });
};
const OrderDetailModal = ({ order, onClose, onEdit, onDelete, allOrders, onSuccess, onStatusChange, onMissingClick, onUpdateOrder }) => {
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const [generatingPdf, setGeneratingPdf] = reactExports.useState(false);
  const [savingImage, setSavingImage] = reactExports.useState(false);
  const [verifiedOrders, setVerifiedOrders] = reactExports.useState(getVerifiedSet);
  const [missingOrders, setMissingOrders] = reactExports.useState(getMissingSet);
  const receiptRef = reactExports.useRef(null);
  const proofFileRef = reactExports.useRef(null);
  const warningUploadRef = reactExports.useRef(null);
  const primaryFileRef = reactExports.useRef(null);
  const [isUploadingProof, setIsUploadingProof] = reactExports.useState(false);
  const [isUploadingWarning, setIsUploadingWarning] = reactExports.useState(false);
  const [isUploadingPrimary, setIsUploadingPrimary] = reactExports.useState(false);
  const [viewImageModal, setViewImageModal] = reactExports.useState(null);
  const [viewingGallery, setViewingGallery] = reactExports.useState(null);
  const [currentGalleryIdx, setCurrentGalleryIdx] = reactExports.useState(0);
  const [isDeleting, setIsDeleting] = reactExports.useState(false);
  const [isSharing, setIsSharing] = reactExports.useState(false);
  const [isUnlinking, setIsUnlinking] = reactExports.useState(null);
  const [updateTrigger, setUpdateTrigger] = reactExports.useState(0);
  React__default.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (linkedOrders.length > 0) {
        try {
          const remainingIds = linkedOrders.map((o) => o.id);
          await fetchWithRetry(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({ action: "merge_buying_price", sheet: order.sheet_name, row_ids: [order.id] })
          });
          if (remainingIds.length > 0) {
            await fetchWithRetry(SCRIPT_URL, {
              method: "POST",
              body: JSON.stringify({ action: "merge_buying_price", sheet: order.sheet_name, row_ids: remainingIds })
            });
          }
        } catch (e) {
          console.error("Failed unlink before delete", e);
        }
      }
      const res = await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "delete",
          row_id: order.id,
          sheet: order.sheet_name,
          linkedOrderIds: []
        })
      });
      const text = await res.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.warn("Invalid JSON:", text.substring(0, 50));
        throw new Error("Invalid response from server.");
      }
      if (result.status === "success") {
        if (onDelete) onDelete();
        else {
          onSuccess();
          onClose();
        }
      } else {
        alert("Failed to delete: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while deleting the order.");
    } finally {
      setIsDeleting(false);
    }
  };
  const {
    linkedOrders,
    combinedPrice,
    combinedInitial,
    shipping,
    total,
    remaining,
    basePrice,
    isFree
  } = getLinkedOrdersInfo(order, allOrders);
  const status = getOrderStatus(order);
  const key = `${order.id}-${order.sheet_name}`;
  const isVerified = verifiedOrders.has(key);
  const isMissing = missingOrders.has(key) || !!order.warningImageUrl;
  const handleWarningImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      if (warningUploadRef.current) warningUploadRef.current.value = "";
      return;
    }
    setIsUploadingWarning(true);
    try {
      const { uploadToImgBB: uploadToImgBB2 } = await import("./order-utils-fqXvoRHs.mjs");
      const url = await uploadToImgBB2(file);
      const newImages = { ...getMissingImages(), [key]: url };
      saveMissingImages(newImages);
      const next = new Set(missingOrders);
      next.add(key);
      setMissingOrders(next);
      saveMissingSet(next);
      await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "update_warning_picture", sheet_name: order.sheet_name, row_id: order.id, image_url: url })
      });
      order.warningImageUrl = url;
      const role = localStorage.getItem("auth_role") || "unknown";
      const { sendNotification: sendNotification2 } = await import("./notifications-DWkTZayr.mjs").then((n) => n.n);
      sendNotification2("warning", `WARNING added to order: ${order.name || order.insta}. Please check!`, role, order, true);
    } catch (err) {
      alert("Failed to upload warning image");
    } finally {
      setIsUploadingWarning(false);
    }
  };
  const handlePrimaryImageChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      if (primaryFileRef.current) primaryFileRef.current.value = "";
      return;
    }
    setIsUploadingPrimary(true);
    try {
      const { uploadToImgBB: uploadToImgBB2 } = await import("./order-utils-fqXvoRHs.mjs");
      const uploaded = await Promise.all(Array.from(files).map((f) => uploadToImgBB2(f)));
      const existing = order.primary_urls ? String(order.primary_urls).split(",").filter(Boolean) : [];
      const merged = [...existing, ...uploaded].join(",");
      await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "update_primary_picture", sheet_name: order.sheet_name, row_id: order.id, primary_urls: merged })
      });
      order.primary_urls = merged;
      if (onUpdateOrder) onUpdateOrder(order.id, order.sheet_name, { primary_urls: merged });
    } catch (err) {
      alert("Failed to upload primary image");
    } finally {
      setIsUploadingPrimary(false);
      if (primaryFileRef.current) primaryFileRef.current.value = "";
    }
  };
  const handleProofImageChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      if (proofFileRef.current) proofFileRef.current.value = "";
      return;
    }
    setIsUploadingProof(true);
    try {
      const { uploadToImgBB: uploadToImgBB2 } = await import("./order-utils-fqXvoRHs.mjs");
      const uploaded = await Promise.all(Array.from(files).map((f) => uploadToImgBB2(f)));
      const lastUrl = uploaded[uploaded.length - 1];
      const exist = order.proof_urls ? Array.isArray(order.proof_urls) ? order.proof_urls : String(order.proof_urls).split(",").filter(Boolean) : order.image_url ? [String(order.image_url)] : [];
      const newUrls = [...exist, ...uploaded];
      const merged = newUrls.join(",");
      await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "update_proof_picture",
          sheet_name: order.sheet_name,
          row_id: order.id,
          image_url: lastUrl,
          proof_url: lastUrl,
          proof_urls: merged,
          secondary_images: merged
        })
      });
      order.image_url = lastUrl;
      order.proof_urls = newUrls;
      if (onUpdateOrder) {
        onUpdateOrder(order.id, order.sheet_name, { image_url: lastUrl, proof_urls: newUrls });
      }
    } catch (err) {
      alert("Failed to upload proof image");
    } finally {
      setIsUploadingProof(false);
      if (proofFileRef.current) proofFileRef.current.value = "";
    }
  };
  const handleUnmarkMissing = () => {
    setViewImageModal(null);
    const next = new Set(missingOrders);
    next.delete(key);
    setMissingOrders(next);
    saveMissingSet(next);
    const nextImages = { ...getMissingImages() };
    delete nextImages[key];
    import("./GlobalCalculator-qKTf8MtO.mjs").then((n) => n.x).then((m) => m.saveMissingImages(nextImages));
    if (onUpdateOrder) {
      onUpdateOrder(order.id, order.sheet_name, { warningBase64: void 0, warningImageUrl: void 0 });
    }
    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "update_warning_picture", row_id: order.id, sheet_name: order.sheet_name, image_url: "" })
    }).catch(() => {
    });
    fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "markMissing", row_id: order.id, sheet_name: order.sheet_name, missing: false }) }).catch(() => {
    });
    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "remove_warning_notification", row_id: order.id, sheet_name: order.sheet_name })
    }).catch(() => {
    });
  };
  const handleRemoveLink = async (targetIo) => {
    setIsUnlinking(targetIo.id);
    try {
      const allCluster = [order, ...linkedOrders];
      const remainingIds = allCluster.filter((o) => o.id !== targetIo.id).map((o) => o.id);
      const updates = [];
      updates.push(fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "merge_buying_price", sheet: targetIo.sheet_name, row_ids: [targetIo.id] })
      }));
      if (remainingIds.length > 0) {
        updates.push(fetchWithRetry(SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({ action: "merge_buying_price", sheet: order.sheet_name, row_ids: remainingIds })
        }));
      }
      await Promise.all(updates);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to remove link");
    } finally {
      setIsUnlinking(null);
    }
  };
  const handlePdf = async () => {
    if (generatingPdf) return;
    setGeneratingPdf(true);
    try {
      const { generateSingleOrderPdf } = await import("./pdf-CgKnyAtT.mjs");
      generateSingleOrderPdf(order, allOrders);
    } catch (err) {
      console.error(err);
      alert("PDF generation failed");
    } finally {
      setGeneratingPdf(false);
    }
  };
  const handleSaveReceiptImage = reactExports.useCallback(async () => {
    if (!receiptRef.current || savingImage) return;
    setSavingImage(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: "#ffffff"
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Receipt_${order.insta || order.name || order.id}.png`;
      link.click();
    } catch (err) {
      console.error("Image save error", err);
    } finally {
      setSavingImage(false);
    }
  }, [order, savingImage]);
  const handleShare = async () => {
    const text = `📦 Order Details
👤 Name: ${order.name || "-"}
📸 Instagram: ${order.insta || "-"}
📱 Phone: ${order.phone || "-"}
📍 Location: ${order.place || "-"}
💰 Total: ${total.toLocaleString()} IQD
🚚 Shipping: ${shipping.toLocaleString()} IQD
💳 Advance: ${combinedInitial.toLocaleString()} IQD
📉 Remaining: ${remaining.toLocaleString()} IQD
🆔 Order No: ${cleanOrderNo(order.orderNo) || "Pending"}`;
    if (!navigator.share) {
      navigator.clipboard.writeText(text).then(() => alert("Copied text to clipboard!"));
      return;
    }
    try {
      setIsSharing(true);
      let fileToShare = null;
      if (receiptRef.current) {
        const dataUrl = await toPng(receiptRef.current, { quality: 1, pixelRatio: 2, backgroundColor: "#ffffff" });
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        fileToShare = new File([blob], `Order_${cleanOrderNo(order.orderNo) || "Pending"}.png`, { type: "image/png" });
      }
      if (fileToShare && navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
        await navigator.share({
          title: "Order Details",
          text,
          files: [fileToShare]
        });
      } else {
        await navigator.share({ title: "Order Details", text });
      }
    } catch (err) {
      console.error("Share error", err);
    } finally {
      setIsSharing(false);
    }
  };
  const handleVerify = () => {
    const next = new Set(verifiedOrders);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setVerifiedOrders(next);
    saveVerifiedSet(next);
    fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "verifyOrder", row_id: order.id, sheet_name: order.sheet_name, matchStatus: next.has(key) ? "match" : "mismatch" }) }).catch(() => {
    });
  };
  const DetailRow = ({ label, value, accent }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-end py-1.5 border-b border-border/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-medium", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-semibold ${accent ? "text-primary" : ""}`, children: value })
  ] });
  const formatImg = (img) => {
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    if (img.length > 100) return `data:image/jpeg;base64,${img}`;
    return img;
  };
  const primaryImages = [];
  if (order.primary_urls) {
    primaryImages.push(...String(order.primary_urls).split(",").filter(Boolean).map(formatImg));
  }
  const proofImages = [];
  if (order.proof_urls && order.proof_urls.length > 0) {
    if (Array.isArray(order.proof_urls)) {
      proofImages.push(...order.proof_urls.map(formatImg));
    } else {
      proofImages.push(...String(order.proof_urls).split(",").filter(Boolean).map(formatImg));
    }
  } else if (order.image_url) {
    proofImages.push(formatImg(order.image_url));
  }
  if (order.secondaryImages) {
    proofImages.push(...order.secondaryImages.map(formatImg));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-foreground/30 backdrop-blur-sm", onClick: onClose }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-card border w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-slide-up ${isVerified ? "border-primary/30" : isMissing ? "border-amber-400/30" : "border-border"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border flex justify-between items-center bg-secondary/50 rounded-t-2xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsEditing(false), className: "p-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-muted-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-muted-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg", children: isEditing ? "Edit Order" : "Order Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-xs", children: [
                "ID: ",
                order.id,
                " · ",
                order.sheet_name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-1.5 py-0.5 rounded text-[10px] font-semibold border ${STATUS_COLORS[status]}`, children: status })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: primaryFileRef, className: "hidden", accept: "image/*", multiple: true, onChange: handlePrimaryImageChange }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: warningUploadRef, className: "hidden", accept: "image/*", onChange: handleWarningImageChange }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: proofFileRef, className: "hidden", accept: "image/*", multiple: true, onChange: handleProofImageChange }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex bg-secondary rounded-lg overflow-hidden border border-amber-400/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
            const key2 = `${order.id}-${order.sheet_name}`;
            if (missingOrders.has(key2) || !!order.warningImageUrl) {
              setViewImageModal(key2);
            } else {
              warningUploadRef.current?.click();
            }
          }, className: `p-1.5 transition-all outline-none ${isMissing ? "bg-amber-400 text-white" : "text-muted-foreground hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"}`, title: isMissing ? "View Warning Picture" : "Upload Warning Picture", children: isUploadingWarning ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" }) : isMissing ? /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { size: 14 }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleVerify, className: `p-1.5 rounded-lg transition-all ${isVerified ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-primary"} ml-1`, title: "Verify", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { size: 16, fill: isVerified ? "currentColor" : "none" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-muted-foreground transition-colors ml-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-5 custom-scrollbar", children: isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsx(OrderFormView, { activeSheet: order.sheet_name, editingOrder: order, onCancel: () => setIsEditing(false), onSuccess: (payload) => {
        setIsEditing(false);
        onSuccess(payload);
      }, allOrders }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-muted-foreground mr-2", children: "Status:" }),
          ["pending", "approved", "arrived", "cancelled"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onStatusChange(order, s), className: `px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${status === s ? STATUS_COLORS[s] : "bg-secondary text-muted-foreground border-transparent hover:border-border"}`, children: s }, s))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border border-border/60 rounded-xl p-3 bg-card shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 16 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-muted-foreground", children: "Box:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold", children: getBoxName(order) ? `Box ${getBoxName(order)}` : "None" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                const currentBox = getBoxName(order);
                const newBox = window.prompt(`Change Box Name for ${order.name || order.insta || "this order"}:`, currentBox);
                if (newBox !== null && newBox.trim() !== currentBox) {
                  const trimmed = newBox.trim();
                  fetchWithRetry(SCRIPT_URL, {
                    method: "POST",
                    body: JSON.stringify({
                      action: "update_box_name",
                      row_id: order.id,
                      sheet: order.sheet_name,
                      box_name: trimmed
                    })
                  }).then(() => {
                    order.box_name = trimmed;
                    onSuccess();
                  }).catch(() => alert("Failed to update box name"));
                }
              },
              className: "px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1.5 text-xs font-bold border border-primary/20",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 12 }),
                "Change box"
              ]
            }
          )
        ] }),
        proofImages.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setCurrentGalleryIdx(0);
              setViewingGallery({ title: "Proof Pictures", images: proofImages, initialIndex: 0 });
            },
            className: "w-full py-1.5 flex items-center justify-center gap-2 bg-secondary/50 hover:bg-secondary rounded-xl border border-border border-dashed transition-all",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded overflow-hidden shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: proofImages[0], referrerPolicy: "no-referrer", className: "w-full h-full object-cover", alt: "Proof Thumbnail" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold", children: [
                "View Proof Picture ",
                proofImages.length > 1 ? `(${proofImages.length})` : ""
              ] })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-4 mt-2 flex-col sm:flex-row flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => primaryFileRef.current?.click(), disabled: isUploadingPrimary, className: "flex-[1_1_100%] sm:flex-[1_1_48%] py-2 flex items-center justify-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 rounded-xl transition-all text-[11px] font-bold disabled:opacity-50 border border-blue-500/20", children: [
            isUploadingPrimary ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { size: 14 }),
            "Upload Primary Picture"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => proofFileRef.current?.click(), disabled: isUploadingProof, className: "flex-[1_1_100%] sm:flex-[1_1_48%] py-2 flex items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all text-[11px] font-bold disabled:opacity-50 border border-primary/20", children: [
            isUploadingProof ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 14 }),
            "Upload Proof Picture"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-[1_1_100%] gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => warningUploadRef.current?.click(), disabled: isUploadingWarning, className: "flex-[1_1_100%] py-2 flex items-center justify-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 rounded-xl transition-all text-[11px] font-bold disabled:opacity-50 border border-amber-500/20", children: [
            isUploadingWarning ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { size: 14 }),
            "Upload Warning Picture"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: receiptRef, className: "bg-card border border-border rounded-2xl overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 text-center space-y-2 bg-secondary/30 border-b border-dashed border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block bg-foreground text-background px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest", children: "Receipt" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold tracking-tight uppercase", children: "SHEIN KURDISTANI" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-[10px] text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: order.date?.split(" ")[0] || "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1 h-1 rounded-full bg-border" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "#",
                cleanOrderNo(order.orderNo) || "PENDING"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 space-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Customer", value: order.name || "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Instagram", value: `@${order.insta || "-"}`, accent: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Phone", value: order.phone || "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Location", value: order.place || "-" }),
            order.sku && /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "SKU", value: order.sku }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "SKU Qty", value: String(order.pics_text || "1") }),
            linkedOrders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              DetailRow,
              {
                label: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Item Price ",
                  isOrderFree(order) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-green-500/20 text-green-600 px-1 rounded uppercase font-bold ml-1", children: "Free Ship" })
                ] }),
                value: `${basePrice.toLocaleString()} IQD`
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                DetailRow,
                {
                  label: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Item Price ",
                    isOrderFree(order) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-green-500/20 text-green-600 px-1 rounded uppercase font-bold ml-1", children: "Free Ship" })
                  ] }),
                  value: `${basePrice.toLocaleString()} IQD`
                }
              ),
              linkedOrders.map((lo) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                DetailRow,
                {
                  label: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "🔗 ",
                    lo.name || lo.insta,
                    " ",
                    isOrderFree(lo) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-green-500/20 text-green-600 px-1 rounded uppercase font-bold ml-1", children: "Free Ship" })
                  ] }),
                  value: `${getDisplayPrice(lo).toLocaleString()} IQD`
                },
                `${lo.id}-${lo.sheet_name}`
              )),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "All Items Total", value: `${combinedPrice.toLocaleString()} IQD`, accent: true })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Shipping", value: isFree ? "Free Ship (0 IQD)" : `${shipping.toLocaleString()} IQD` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Advance Paid", value: `${combinedInitial.toLocaleString()} IQD`, accent: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-3 mt-3 border-t-2 border-border flex justify-between items-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold", children: "Remaining" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xl font-bold font-mono ${remaining > 0 ? "text-amber-500" : "text-primary"}`, children: [
                remaining.toLocaleString(),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "IQD" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleSaveReceiptImage, disabled: savingImage, className: "w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2.5 rounded-lg transition-all text-sm disabled:opacity-50", children: [
          savingImage ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 14 }),
          "Save Receipt as Image"
        ] }),
        linkedOrders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/50 p-3 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 14, className: "text-primary" }),
            " Linked Orders (",
            linkedOrders.length,
            ")"
          ] }),
          linkedOrders.map((lo) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center py-1.5 text-xs group transition-all", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              lo.name || lo.insta,
              " · #",
              lo.id,
              " · ",
              lo.sheet_name,
              " ",
              isOrderFree(lo) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-green-500/20 text-green-600 px-1 rounded uppercase font-bold ml-1", children: "Free Ship" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono font-semibold", children: [
                getDisplayPrice(lo).toLocaleString(),
                " IQD"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    handleRemoveLink(lo);
                  },
                  disabled: isUnlinking === lo.id,
                  className: "p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity opacity-0 group-hover:opacity-100 disabled:opacity-100",
                  title: "Remove linked order",
                  children: isUnlinking === lo.id ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 })
                }
              )
            ] })
          ] }, `${lo.id}-${lo.sheet_name}`))
        ] }),
        order.link && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: order.link, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 text-primary text-sm hover:underline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 14 }),
          " View Product Link"
        ] }),
        order.note && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary p-3 rounded-lg mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium text-muted-foreground", children: "Notes:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: order.note })
        ] }),
        primaryImages.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setCurrentGalleryIdx(0);
              setViewingGallery({ title: "Primary Pictures", images: primaryImages, initialIndex: 0 });
            },
            className: "w-full py-1.5 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl border border-primary/20 border-dashed transition-all",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded overflow-hidden shadow-sm border border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: primaryImages[0], referrerPolicy: "no-referrer", className: "w-full h-full object-cover", alt: "Primary Thumbnail" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold", children: [
                "View Primary Picture ",
                primaryImages.length > 1 ? `(${primaryImages.length})` : ""
              ] })
            ]
          }
        ) })
      ] }) }),
      !isEditing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 sm:p-3 border-t border-border flex justify-between gap-1 sm:gap-2 bg-secondary/30 rounded-b-2xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "flex items-center justify-center bg-secondary hover:bg-secondary/80 text-foreground font-medium p-2 rounded-lg transition-all shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleDelete, disabled: isDeleting, className: "flex-1 flex items-center justify-center gap-1 bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium py-2 px-0 text-[10px] sm:text-xs rounded-lg transition-all disabled:opacity-50 min-w-0", children: [
          isDeleting ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14, className: "shrink-0" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: "Del" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handlePdf, disabled: generatingPdf, className: "flex-1 flex items-center justify-center gap-1 bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2 px-0 text-[10px] sm:text-xs rounded-lg transition-all disabled:opacity-50 min-w-0", children: [
          generatingPdf ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 14, className: "shrink-0" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: "PDF" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleShare, disabled: isSharing, className: "flex-1 flex items-center justify-center gap-1 bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2 px-0 text-[10px] sm:text-xs rounded-lg transition-all disabled:opacity-50 min-w-0", children: [
          isSharing ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { size: 14, className: "shrink-0" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: "Share" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsEditing(true), className: "flex-1 flex items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-0 text-[10px] sm:text-xs rounded-lg transition-all glow-primary min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 14, className: "shrink-0" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: "Edit" })
        ] })
      ] })
    ] }),
    viewImageModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[200] bg-background/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative flex flex-col items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewImageModal(null), className: "absolute -top-4 -right-4 bg-background border border-border text-foreground rounded-full p-2 hover:bg-secondary transition-colors shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 28 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-secondary/50 p-2 rounded-xl border border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: order.warningImageUrl || getMissingImages()[viewImageModal], alt: "Warning", referrerPolicy: "no-referrer", className: "max-w-full max-h-[70vh] object-contain rounded-lg" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 flex gap-4 w-full justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleUnmarkMissing, className: "px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18 }),
        "Unmark Warning"
      ] }) })
    ] }) }),
    viewingGallery && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-[300] bg-black/95 flex flex-col animate-in fade-in duration-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 flex justify-between items-center text-white border-b border-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-sm", children: [
          viewingGallery.title,
          " - ",
          currentGalleryIdx + 1,
          " / ",
          viewingGallery.images.length
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            setViewingGallery(null);
            setIsEditing(true);
          }, className: "flex items-center gap-2 bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 14 }),
            " Edit / Delete Pictures"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewingGallery(null), className: "text-white/60 hover:text-white transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 24 }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex items-center justify-center relative overflow-hidden p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: viewingGallery.images[currentGalleryIdx],
            referrerPolicy: "no-referrer",
            className: "max-w-full max-h-full object-contain select-none",
            alt: "Gallery Preview"
          }
        ),
        currentGalleryIdx > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              setCurrentGalleryIdx((idx) => idx - 1);
            },
            className: "absolute left-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all active:scale-90",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 24 })
          }
        ),
        currentGalleryIdx < viewingGallery.images.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              setCurrentGalleryIdx((idx) => idx + 1);
            },
            className: "absolute right-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all active:scale-90",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 24 })
          }
        )
      ] })
    ] })
  ] });
};
const BatchesView = ({ orders, allOrders, onOrderClick, onRefresh, onStatusChange, viewingMonth, setViewingMonth, activeYear, setActiveYear, role }) => {
  const [expandedBox, setExpandedBox] = reactExports.useState(null);
  const [editingField, setEditingField] = reactExports.useState(null);
  const [fieldInput, setFieldInput] = reactExports.useState("");
  const [isSyncing, setIsSyncing] = reactExports.useState(false);
  const [copiedBox, setCopiedBox] = reactExports.useState(null);
  const [isDownloading, setIsDownloading] = reactExports.useState(null);
  const [verifiedOrders, setVerifiedOrders] = reactExports.useState(getVerifiedSet);
  const [missingOrders, setMissingOrders] = reactExports.useState(getMissingSet);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [creatingBox, setCreatingBox] = reactExports.useState(false);
  const [selectedForBox, setSelectedForBox] = reactExports.useState(/* @__PURE__ */ new Set());
  const [newBoxName, setNewBoxName] = reactExports.useState("");
  const [createSearch, setCreateSearch] = reactExports.useState("");
  const [showMonthPicker, setShowMonthPicker] = reactExports.useState(false);
  const monthPickerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const handle = (e) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(e.target)) setShowMonthPicker(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);
  const [editingBoxPrice, setEditingBoxPrice] = reactExports.useState(null);
  const [priceInput, setPriceInput] = reactExports.useState("");
  const [renamingBox, setRenamingBox] = reactExports.useState(null);
  const [renameInput, setRenameInput] = reactExports.useState("");
  const autoBoxCounter = reactExports.useMemo(() => {
    const nums = orders.filter((o) => String(o.box_name || "").trim().match(/^Box \d+$/)).map((o) => parseInt(String(o.box_name).replace("Box ", "")) || 0);
    return nums.length > 0 ? Math.max(...nums) + 1 : 1;
  }, [orders]);
  const boxes = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    const inheritedBoxNames = /* @__PURE__ */ new Map();
    orders.forEach((o) => {
      const boxName = String(o.box_name || "").trim();
      if (boxName) {
        const group = getLinkedGroup(o, allOrders);
        group.forEach((lo) => {
          const inCurrentMonth = orders.some((m) => m.id === lo.id && m.sheet_name === lo.sheet_name);
          if (inCurrentMonth && !String(lo.box_name || "").trim()) {
            const key = `${lo.id}-${lo.sheet_name}`;
            inheritedBoxNames.set(key, boxName);
          }
        });
      }
    });
    orders.forEach((o) => {
      const key = `${o.id}-${o.sheet_name}`;
      const boxName = String(o.box_name || "").trim() || inheritedBoxNames.get(key) || "";
      if (boxName) {
        map.set(boxName, [...map.get(boxName) || [], o]);
      }
    });
    const result = [];
    map.forEach((boxOrders, box_name) => {
      const totalPieces = boxOrders.reduce((s, o) => s + (Number(o.pics_text) || 0), 0);
      const totalPrice = boxOrders.reduce((s, o) => s + (parseFloat(String(o.price).replace(/[^0-9.-]+/g, "")) || 0), 0);
      const orderWithBoxCost = boxOrders.find((o) => Number(String(o.box_cost || "").replace(/[^0-9.-]+/g, "")) > 0) || boxOrders[0];
      const boxCost = Number(String(orderWithBoxCost?.box_cost || "").replace(/[^0-9.-]+/g, "")) || 0;
      const orderWithShippingCost = boxOrders.find((o) => Number(String(o.shipping_cost || "").replace(/[^0-9.-]+/g, "")) !== 0) || boxOrders[0];
      const shippingCost = Number(String(orderWithShippingCost?.shipping_cost || "").replace(/[^0-9.-]+/g, "")) || 0;
      const lostLevelOrder = boxOrders.find((o) => Number(String(o.lost || "").replace(/[^0-9.-]+/g, "")) > 0) || boxOrders[0];
      const profitLevelOrder = boxOrders.find((o) => Number(String(o.profit || "").replace(/[^0-9.-]+/g, "")) > 0) || boxOrders[0];
      const lost = Number(String(lostLevelOrder?.lost || "").replace(/[^0-9.-]+/g, "")) || 0;
      const profit = Number(String(profitLevelOrder?.profit || "").replace(/[^0-9.-]+/g, "")) || 0;
      const isAutoGenerated = /^Box[ -]\d+$/.test(box_name);
      const allHavePrice = boxOrders.every((o) => {
        const p = parseFloat(String(o.price).replace(/[^0-9.-]+/g, "")) || 0;
        return p > 0;
      });
      let status = "pending";
      const extra = String(boxOrders[0]?.extra || "").trim();
      const match = extra.match(/\[(PENDING|APPROVED|ARRIVED|CANCELLED)\]/i);
      if (match) {
        const parsed = match[1].toLowerCase();
        if (!allHavePrice && (parsed === "approved" || parsed === "arrived")) {
          status = "pending";
        } else {
          status = parsed;
        }
      }
      const isFinished = boxOrders.some((o) => o.is_finished === true);
      result.push({ box_name, orders: boxOrders, totalPieces, totalPrice, boxCost, shippingCost, lost, profit, isAutoGenerated, isBought: boxCost > 0, status, isFinished });
    });
    return result.sort((a, b) => {
      if (a.isBought !== b.isBought) return a.isBought ? 1 : -1;
      const matchA = a.box_name.match(/\d+/);
      const matchB = b.box_name.match(/\d+/);
      const numA = matchA ? parseInt(matchA[0], 10) : NaN;
      const numB = matchB ? parseInt(matchB[0], 10) : NaN;
      const isNumA = !isNaN(numA);
      const isNumB = !isNaN(numB);
      if (isNumA && isNumB) {
        return numB - numA;
      }
      return b.box_name.localeCompare(a.box_name);
    });
  }, [orders]);
  const filteredBoxes = reactExports.useMemo(() => {
    if (!searchTerm) return boxes;
    const q = searchTerm.toLowerCase();
    return boxes.filter((b) => b.box_name.toLowerCase().includes(q) || b.orders.some((o) => [o.name, o.insta, o.phone].some((f) => String(f || "").toLowerCase().includes(q))));
  }, [boxes, searchTerm]);
  const unbatchedOrders = reactExports.useMemo(() => {
    const unbatched = [];
    const seenGroups = /* @__PURE__ */ new Set();
    for (const o of orders) {
      if (String(o.box_name || "").trim()) continue;
      const group = getLinkedGroup(o, allOrders);
      if (group.some((lo) => String(lo.box_name || "").trim())) continue;
      group.sort((a, b) => {
        const idA = typeof a.id === "string" ? parseInt(a.id) : Number(a.id);
        const idB = typeof b.id === "string" ? parseInt(b.id) : Number(b.id);
        return idA - idB;
      });
      const parent = group[0];
      const parentKey = `${parent.id}-${parent.sheet_name}`;
      if (!seenGroups.has(parentKey)) {
        seenGroups.add(parentKey);
        if (parent.id === o.id && parent.sheet_name === o.sheet_name) {
          unbatched.push(o);
        }
      }
    }
    return unbatched;
  }, [orders, allOrders]);
  const filteredUnbatched = reactExports.useMemo(() => {
    if (!createSearch) return unbatchedOrders;
    const q = createSearch.toLowerCase();
    return unbatchedOrders.filter((o) => [o.name, o.insta, o.phone, o.place].some((f) => String(f || "").toLowerCase().includes(q)));
  }, [unbatchedOrders, createSearch]);
  const toggleSelectOrder = (order) => {
    const key = `${order.id}-${order.sheet_name}`;
    setSelectedForBox((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const handleAutoBox = reactExports.useCallback(async () => {
    if (unbatchedOrders.length === 0) return;
    setIsSyncing(true);
    try {
      let boxNum = autoBoxCounter;
      let currentBoxPieces = 0;
      const existingBox = orders.filter((o) => String(o.box_name || "").trim() === `Box ${boxNum - 1}`);
      if (existingBox.length > 0) {
        const existingPieces = existingBox.reduce((s, o) => s + (Number(o.pics_text) || 0), 0);
        if (existingPieces < 90) {
          boxNum = boxNum - 1;
          currentBoxPieces = existingPieces;
        }
      }
      const assignments = [];
      for (const order of unbatchedOrders) {
        const pieces = Number(order.pics_text) || 1;
        if (currentBoxPieces + pieces > 110 && currentBoxPieces >= 90) {
          boxNum++;
          currentBoxPieces = 0;
        }
        if (currentBoxPieces >= 90 && currentBoxPieces <= 110) {
          boxNum++;
          currentBoxPieces = 0;
        }
        assignments.push({ order, boxName: `Box ${boxNum}` });
        currentBoxPieces += pieces;
      }
      const bySheetBoxName = /* @__PURE__ */ new Map();
      for (const { order, boxName } of assignments) {
        const key = `${order.sheet_name}|${boxName}`;
        bySheetBoxName.set(key, [...bySheetBoxName.get(key) || [], order.id]);
      }
      for (const [key, row_ids] of bySheetBoxName.entries()) {
        const [sheet, box_name] = key.split("|");
        await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "update_box_name", row_ids, sheet, box_name }) });
      }
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  }, [unbatchedOrders, autoBoxCounter, orders, onRefresh]);
  const handleCreateBox = reactExports.useCallback(async () => {
    if (!newBoxName.trim() || selectedForBox.size === 0) return;
    setIsSyncing(true);
    try {
      const sel = unbatchedOrders.filter((o) => selectedForBox.has(`${o.id}-${o.sheet_name}`));
      const bySheet = /* @__PURE__ */ new Map();
      sel.forEach((order) => {
        const sheet = order.sheet_name;
        bySheet.set(sheet, [...bySheet.get(sheet) || [], order.id]);
      });
      for (const [sheet, row_ids] of bySheet.entries()) {
        await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "update_box_name", row_ids, sheet, box_name: newBoxName.trim() }) });
      }
      setCreatingBox(false);
      setSelectedForBox(/* @__PURE__ */ new Set());
      setNewBoxName("");
      setCreateSearch("");
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  }, [newBoxName, selectedForBox, unbatchedOrders, onRefresh]);
  const handleRenameBox = reactExports.useCallback(async (box) => {
    if (box.isFinished) return;
    if (!renameInput.trim() || renameInput.trim() === box.box_name) {
      setRenamingBox(null);
      return;
    }
    setIsSyncing(true);
    try {
      const bySheet = /* @__PURE__ */ new Map();
      box.orders.forEach((order) => {
        const sheet = order.sheet_name;
        bySheet.set(sheet, [...bySheet.get(sheet) || [], order.id]);
      });
      for (const [sheet, row_ids] of bySheet.entries()) {
        await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "update_box_name", row_ids, sheet, box_name: renameInput.trim() }) });
      }
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
      setRenamingBox(null);
    }
  }, [renameInput, onRefresh]);
  const handleBoxStatusChange = reactExports.useCallback(async (box, newStatus) => {
    if (box.isFinished) return;
    if (newStatus === "approved" || newStatus === "arrived") {
      const allHavePrice = box.orders.every((o) => {
        const p = parseFloat(String(o.price).replace(/[^0-9.-]+/g, "")) || 0;
        return p > 0;
      });
      if (!allHavePrice) {
        alert("Cannot set box to " + newStatus + ". All orders must have a price (cell E) first.");
        return;
      }
    }
    setIsSyncing(true);
    try {
      for (const order of box.orders) {
        await onStatusChange(order, newStatus);
      }
      if (newStatus === "approved") {
        const role2 = localStorage.getItem("auth_role") || "unknown";
        const instas = Array.from(new Set(box.orders.map((o) => o.insta || "Unknown"))).filter((i) => i !== "Unknown");
        const boxName = box.box_name || "Unnamed Box";
        sendNotification("approve", `Box approved: ${boxName}
Users: ${instas.join(", ")}`, role2);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  }, [onStatusChange]);
  const handleSaveField = reactExports.useCallback(async (box, field) => {
    if (box.isFinished) return;
    const value = Number(fieldInput.replace(/[^0-9.-]+/g, "")) || 0;
    setIsSyncing(true);
    try {
      const firstIdsBySheet = /* @__PURE__ */ new Map();
      const restIdsBySheet = /* @__PURE__ */ new Map();
      box.orders.forEach((order, index) => {
        const sheet = order.sheet_name;
        if (index === 0) {
          order[field] = value || "";
          firstIdsBySheet.set(sheet, [...firstIdsBySheet.get(sheet) || [], order.id]);
        } else {
          order[field] = "";
          restIdsBySheet.set(sheet, [...restIdsBySheet.get(sheet) || [], order.id]);
        }
      });
      const actionMap = {
        "box_cost": "update_box_cost",
        "shipping_cost": "update_shipping",
        "box_name": "update_box_name",
        "lost": "update_lost",
        "profit": "update_profit"
      };
      const action = actionMap[field];
      if (action) {
        for (const [sheet, row_ids] of firstIdsBySheet.entries()) {
          await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action, row_ids, sheet, value: value || "" }) });
        }
        for (const [sheet, row_ids] of restIdsBySheet.entries()) {
          await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action, row_ids, sheet, value: "" }) });
        }
      } else {
        for (let i = 0; i < box.orders.length; i++) {
          const order = box.orders[i];
          await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ ...order, sheet: order.sheet_name, row_id: order.id, [field]: i === 0 ? value || "" : "", force_update: true }) });
        }
      }
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
      setEditingField(null);
    }
  }, [fieldInput, onRefresh]);
  const handleSaveOrderPrice = reactExports.useCallback(async (order) => {
    if (order.is_finished) return;
    const newPrice = Number(priceInput.replace(/[^0-9.-]+/g, "")) || 0;
    setIsSyncing(true);
    try {
      order.price = newPrice;
      await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ ...order, sheet: order.sheet_name, row_id: order.id, price: newPrice, force_update: true }) });
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
      setEditingBoxPrice(null);
    }
  }, [priceInput, onRefresh]);
  const handleFinishBox = reactExports.useCallback(async (box) => {
    if (role !== "owner") return;
    setIsSyncing(true);
    try {
      const bySheet = /* @__PURE__ */ new Map();
      box.orders.forEach((order) => {
        order.is_finished = true;
        bySheet.set(order.sheet_name, [...bySheet.get(order.sheet_name) || [], order.id]);
      });
      for (const [sheet, row_ids] of bySheet.entries()) {
        await fetchWithRetry(SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({ action: "mark_box_finished", sheet, row_ids, finished: true })
        });
      }
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  }, [role, onRefresh]);
  const handleVerify = (order) => {
    if (order.is_finished) return;
    const key = `${order.id}-${order.sheet_name}`;
    const next = new Set(verifiedOrders);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setVerifiedOrders(next);
    saveVerifiedSet(next);
    fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "verifyOrder", row_id: order.id, sheet_name: order.sheet_name, matchStatus: next.has(key) ? "match" : "mismatch" }) }).catch(() => {
    });
  };
  const handleMissing = (order) => {
    if (order.is_finished) return;
    const key = `${order.id}-${order.sheet_name}`;
    const next = new Set(missingOrders);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setMissingOrders(next);
    saveMissingSet(next);
    fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "markMissing", row_id: order.id, sheet_name: order.sheet_name, missing: next.has(key) }) }).catch(() => {
    });
  };
  const copyBox = (box) => {
    const text = box.orders.map((o, i) => {
      const rawPrice = parseFloat(String(o.price).replace(/[^0-9.-]+/g, "")) || 0;
      return `${i + 1}. ${o.name || o.insta} - ${o.place || "-"} - ${rawPrice.toLocaleString()} IQD`;
    }).join("\n");
    navigator.clipboard.writeText(`📦 ${box.box_name}
Pieces: ${box.totalPieces}
${text}

Total: ${box.totalPrice.toLocaleString()} IQD`);
    setCopiedBox(box.box_name);
    setTimeout(() => setCopiedBox(null), 2e3);
  };
  const handleDownloadAllPdfs = async (box) => {
    if (isDownloading) return;
    setIsDownloading(box.box_name);
    try {
      const { generateBatchPdf } = await import("./pdf-CgKnyAtT.mjs");
      generateBatchPdf(box.box_name, box.orders, allOrders);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(null);
    }
  };
  const stats = reactExports.useMemo(() => ({
    total: boxes.length,
    pending: boxes.filter((b) => !b.isBought).length,
    bought: boxes.filter((b) => b.isBought).length,
    totalPieces: boxes.reduce((s, b) => s + b.totalPieces, 0),
    totalValue: boxes.reduce((s, b) => s + b.totalPrice, 0),
    unbatched: unbatchedOrders.length
  }), [boxes, unbatchedOrders]);
  const EditableField = ({ box, field, label, value, colorClass }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-card p-2.5 rounded-lg border border-border ${colorClass || ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-semibold uppercase mb-1", children: label }),
    editingField?.box === box.box_name && editingField?.field === field ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: fieldInput, onChange: (e) => setFieldInput(e.target.value), className: "w-full bg-secondary border border-border rounded px-2 py-1 text-xs", autoFocus: true, onKeyDown: (e) => {
        if (e.key === "Enter") handleSaveField(box, field);
        if (e.key === "Escape") setEditingField(null);
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleSaveField(box, field), className: "text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setEditingField(null), className: "text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: box.isFinished, onClick: () => {
      setEditingField({ box: box.box_name, field });
      setFieldInput(String(value || ""));
    }, className: `text-sm font-bold hover:opacity-80 transition-colors flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-70 ${field === "lost" ? "text-destructive" : field === "profit" ? "text-primary" : ""}`, children: [
      value > 0 ? `${value.toLocaleString()} IQD` : "Set",
      " ",
      !box.isFinished && /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 10 })
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 animate-slide-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Boxes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          stats.total,
          " active boxes • ",
          stats.totalPieces,
          " items • ",
          (stats.totalValue / 1e3).toFixed(0),
          "K IQD"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: monthPickerRef, className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowMonthPicker((p) => !p), className: "flex items-center gap-1.5 bg-secondary text-foreground px-3 py-2 rounded-full text-sm font-semibold hover:bg-secondary/80 transition-all border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 14 }),
            " ",
            viewingMonth || activeYear,
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 12, className: `transition-transform ${showMonthPicker ? "rotate-180" : ""}` })
          ] }),
          showMonthPicker && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 p-2 min-w-[140px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 px-1 pb-2 border-b border-border mb-2", children: Object.keys(YEARS_CONFIG).sort((a, b) => b.localeCompare(a)).map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveYear(y), className: `px-2 py-1 rounded text-[10px] font-bold transition-all ${activeYear === y ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`, children: y }, y)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-0.5", children: (YEARS_CONFIG[activeYear] || []).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              setViewingMonth(m);
              setShowMonthPicker(false);
            }, className: `text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${viewingMonth === m ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`, children: m }, m)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkuSearch, { orders: allOrders, onFound: onOrderClick }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setCreatingBox(true), className: "flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all glow-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
          " New Box"
        ] }),
        unbatchedOrders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleAutoBox, disabled: isSyncing, className: "flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-2 rounded-full text-sm font-semibold hover:bg-accent/90 transition-all disabled:opacity-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PackagePlus, { size: 14 }),
          " Auto (",
          unbatchedOrders.length,
          ")"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", size: 14 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "Search boxes...", className: "w-full bg-secondary border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary/50" })
    ] }),
    unbatchedOrders.length > 0 && !creatingBox && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, className: "text-amber-500 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-amber-700 dark:text-amber-400", children: [
          unbatchedOrders.length,
          " orders without a box"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 dark:text-amber-500", children: 'Click "Auto Box" to automatically assign each order its own box' })
      ] })
    ] }),
    creatingBox && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-primary/20 rounded-xl p-4 space-y-3 animate-slide-up", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm", children: "Create New Box" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setCreatingBox(false);
          setSelectedForBox(/* @__PURE__ */ new Set());
        }, className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: newBoxName, onChange: (e) => setNewBoxName(e.target.value), placeholder: "Box name (e.g. Box 5)", className: "w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: createSearch, onChange: (e) => setCreateSearch(e.target.value), placeholder: "Search unbatched orders...", className: "w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-48 overflow-y-auto space-y-1 custom-scrollbar", children: filteredUnbatched.map((o) => {
        const key = `${o.id}-${o.sheet_name}`;
        const linkedOrders = getLinkedGroup(o, allOrders).filter((lo) => lo.id !== o.id || lo.sheet_name !== o.sheet_name);
        const rawCombinedPrice = [o, ...linkedOrders].reduce((sum, lo) => sum + (parseFloat(String(lo.price).replace(/[^0-9.-]+/g, "")) || 0), 0);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toggleSelectOrder(o), className: `w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all ${selectedForBox.has(key) ? "bg-primary/10 border border-primary/30" : "bg-secondary hover:bg-secondary/80 border border-transparent"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-4 h-4 rounded border flex items-center justify-center ${selectedForBox.has(key) ? "bg-primary border-primary" : "border-border"}`, children: selectedForBox.has(key) && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 10, className: "text-primary-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium truncate", children: o.name || o.insta }),
          linkedOrders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 12, className: "text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-xs ml-auto", children: [
            rawCombinedPrice.toLocaleString(),
            " IQD"
          ] })
        ] }, key);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCreateBox, disabled: !newBoxName.trim() || selectedForBox.size === 0 || isSyncing, className: "w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 transition-all", children: isSyncing ? "Creating..." : `Create Box (${selectedForBox.size} orders)` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: filteredBoxes.map((box) => {
      const isExpanded = expandedBox === box.box_name;
      const numMatch = box.box_name.match(/(\d+)/);
      const displayName = numMatch ? numMatch[1] : box.box_name;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `border rounded-xl overflow-hidden transition-all ${box.isFinished ? "bg-orange-50/80 border-orange-300 shadow-sm dark:bg-orange-500/10 dark:border-orange-500/30" : box.isBought ? "bg-card border-primary/20" : "bg-card border-border"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "p-4 pb-2 cursor-pointer select-none",
            onClick: (e) => {
              const target = e.target;
              if (!target.closest("button") && !target.closest("input")) {
                setExpandedBox(isExpanded ? null : box.box_name);
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-10 h-10 rounded-xl flex items-center justify-center ${box.isFinished ? "bg-orange-200 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300" : box.isBought ? "bg-primary/10 text-primary" : "bg-amber-50 text-amber-500 dark:bg-amber-500/10"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 20 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    renamingBox === box.box_name ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: renameInput, onChange: (e) => setRenameInput(e.target.value), className: "bg-secondary border border-border rounded px-2 py-1 text-sm font-bold w-32", autoFocus: true, onKeyDown: (e) => {
                        if (e.key === "Enter") handleRenameBox(box);
                        if (e.key === "Escape") setRenamingBox(null);
                      } }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleRenameBox(box), className: "text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14 }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRenamingBox(null), className: "text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-xl", children: displayName }),
                      box.isFinished && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-orange-200 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-800 dark:bg-orange-500/20 dark:text-orange-300", children: "Finished" }),
                      !box.isFinished && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                        e.stopPropagation();
                        setRenamingBox(box.box_name);
                        setRenameInput(box.box_name);
                      }, className: "p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-all", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 12 }) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 mt-1", children: ["pending", "approved", "arrived", "cancelled"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: box.isFinished, onClick: () => handleBoxStatusChange(box, s), className: `px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all disabled:cursor-not-allowed disabled:opacity-70 ${box.status === s ? STATUS_COLORS[s] : "bg-secondary text-muted-foreground border-transparent hover:border-border"}`, children: s.charAt(0).toUpperCase() + s.slice(1) }, s)) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    copyBox(box);
                  }, className: "p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all", children: copiedBox === box.box_name ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 16 }) }),
                  role === "owner" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    handleFinishBox(box);
                  }, disabled: isSyncing || box.isFinished, className: "p-1.5 rounded-lg text-orange-700 hover:bg-orange-100 disabled:opacity-50 dark:text-orange-300 dark:hover:bg-orange-500/10 transition-all", title: "Mark box finished", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    setExpandedBox(isExpanded ? null : box.box_name);
                  }, className: "p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all", children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 20 }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 mt-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary rounded-xl py-3 text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold", children: box.orders.length }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-medium", children: "Orders" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary rounded-xl py-3 text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold", children: box.totalPieces }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-medium", children: "Items" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary rounded-xl py-3 text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-bold tabular-nums", children: box.totalPrice.toLocaleString() }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-medium", children: "IQD Total" })
                ] })
              ] })
            ]
          }
        ),
        (box.lost > 0 || box.profit > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-3 flex gap-3", children: [
          box.lost > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-destructive font-medium", children: [
            "Lost: ",
            box.lost.toLocaleString()
          ] }),
          box.profit > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-primary font-medium", children: [
            "Profit: ",
            box.profit.toLocaleString()
          ] })
        ] }),
        isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-secondary/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(EditableField, { box, field: "box_cost", label: "Box Cost (F)", value: box.boxCost }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(EditableField, { box, field: "shipping_cost", label: "Shipping (H)", value: box.shippingCost }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(EditableField, { box, field: "lost", label: "Lost 60% (K)", value: box.lost, colorClass: "bg-red-50/50 dark:bg-red-500/5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(EditableField, { box, field: "profit", label: "Profit 40% (L)", value: box.profit, colorClass: "bg-emerald-50/50 dark:bg-emerald-500/5" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 p-3 border-t border-border bg-secondary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleDownloadAllPdfs(box), disabled: !!isDownloading, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-all", children: [
            isDownloading === box.box_name ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
            "Download All PDFs"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: box.orders.map((order) => {
            const key = `${order.id}-${order.sheet_name}`;
            const isVerified = verifiedOrders.has(key);
            const isMissing = missingOrders.has(key);
            const orderStatus = getOrderStatus(order);
            const linkedOrders = getLinkedGroup(order, allOrders).filter((o) => o.id !== order.id || o.sheet_name !== order.sheet_name);
            const rawCombinedPrice = [order, ...linkedOrders].reduce((sum, o) => sum + (parseFloat(String(o.price).replace(/[^0-9.-]+/g, "")) || 0), 0);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-3 flex items-center gap-2 hover:bg-secondary/30 transition-colors ${isMissing ? "bg-amber-50/50 dark:bg-amber-500/5" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: order.is_finished, onClick: () => handleMissing(order), className: `shrink-0 w-4 h-4 rounded flex items-center justify-center transition-all disabled:cursor-not-allowed disabled:opacity-50 ${isMissing ? "bg-amber-400 text-white" : "bg-secondary text-muted-foreground hover:text-amber-500"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 10 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 cursor-pointer", onClick: () => onOrderClick(order), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-[14px] truncate", children: [
                    "@",
                    order.insta || order.name || "Unknown",
                    " ",
                    linkedOrders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 10, className: "inline text-primary ml-1" })
                  ] }),
                  String(order.primary_urls || "").trim() && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: "Has primary picture", className: "shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary border border-primary/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { size: 11 }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground flex items-center mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  order.pics_text || 1,
                  " pcs"
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 sm:gap-4 shrink-0 pr-1", children: [
                order.link && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: String(order.link).startsWith("http") ? order.link : `https://${order.link}`, target: "_blank", rel: "noopener noreferrer", className: "w-8 h-8 rounded-full bg-[#0cbaba] text-white hover:bg-[#0aa3a3] transition-colors flex items-center justify-center shadow-sm", onClick: (e) => e.stopPropagation(), title: "Product Link", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 16 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { disabled: order.is_finished, value: orderStatus, onChange: (e) => {
                    e.stopPropagation();
                    onStatusChange(order, e.target.value);
                  }, className: "bg-transparent text-[16px] border-none focus:outline-none text-muted-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 w-6 appearance-none text-center p-0 m-0 leading-none", onClick: (e) => e.stopPropagation(), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pending", children: "⏳" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "approved", children: "✅" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "arrived", children: "📦" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cancelled", children: "❌" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: order.is_finished, onClick: () => handleVerify(order), className: `p-1 transition-all flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50 ${isVerified ? "text-primary" : "text-muted-foreground hover:text-primary"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { size: 16, fill: isVerified ? "currentColor" : "none" }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-end justify-center min-w-[55px]", children: editingBoxPrice?.box === box.box_name && editingBoxPrice?.orderId === order.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: priceInput, onChange: (e) => setPriceInput(e.target.value), className: "w-20 bg-secondary border border-border rounded px-2 py-1 text-xs text-right", autoFocus: true, onKeyDown: (e) => {
                    if (e.key === "Enter") handleSaveOrderPrice(order);
                    if (e.key === "Escape") setEditingBoxPrice(null);
                  }, onClick: (e) => e.stopPropagation() }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    handleSaveOrderPrice(order);
                  }, className: "text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 12 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    setEditingBoxPrice(null);
                  }, className: "text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 12 }) })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-bold text-[14px] leading-none tracking-tight ${order.is_finished ? "cursor-default opacity-80" : "cursor-pointer hover:opacity-80"}`, onClick: (e) => {
                  e.stopPropagation();
                  if (!order.is_finished) {
                    setEditingBoxPrice({ box: box.box_name, orderId: order.id });
                    setPriceInput(String(rawCombinedPrice));
                  }
                }, children: rawCombinedPrice > 0 ? rawCombinedPrice.toLocaleString() : "Set" }) })
              ] })
            ] }, key);
          }) })
        ] })
      ] }, box.box_name);
    }) }),
    filteredBoxes.length === 0 && !creatingBox && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 40, className: "mx-auto text-muted-foreground/30 mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-medium text-sm", children: "No boxes found" })
    ] })
  ] });
};
const SCRIPT_CODE = `// Configuration: Change these variables each month!
var TARGET_COLUMN = "H"; // e.g. "H" for this month, "I" for next month
var START_ROW = 5;
var END_ROW = 25;

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var amount = e.parameter.amount;
  
  if (!amount) {
    return ContentService.createTextOutput("Error: No amount");
  }
  
  // Look for the first empty cell in the target range
  for (var row = START_ROW; row <= END_ROW; row++) {
    var cell = sheet.getRange(TARGET_COLUMN + row);
    if (cell.isBlank() || cell.getValue() === "") {
      cell.setValue(amount);
      return ContentService.createTextOutput("Success");
    }
  }
  
  return ContentService.createTextOutput("Error: Range is full");
}`;
function ExpensesView() {
  const [view, setView] = reactExports.useState("input");
  const [webhookUrl, setWebhookUrl] = reactExports.useState("https://script.google.com/macros/s/AKfycbxH9QSkC7roqWQ-rkKXvdqXVeDywrMJYDzdvJtbYNAD_sNJykxSpCt2JiEyJ267rlyv/exec");
  const [history, setHistory] = reactExports.useState([]);
  reactExports.useEffect(() => {
    const savedUrl = localStorage.getItem("sheet-webhook-url");
    if (savedUrl) setWebhookUrl(savedUrl);
    const savedHistory = localStorage.getItem("expense-history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
      }
    }
  }, []);
  reactExports.useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("expense-history", JSON.stringify(history.slice(0, 50)));
    }
  }, [history]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full min-h-[calc(100vh-120px)] flex flex-col max-w-md mx-auto bg-[#FAF9F6] text-[#3D3D3D] font-sans sm:shadow-sm sm:border-x border-[#EFEBE0] rounded-2xl overflow-hidden mt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster$2, { position: "top-center" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "px-6 py-6 flex items-center justify-between z-10 sticky top-0 bg-[#FAF9F6] sm:bg-transparent border-b border-[#EFEBE0]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-[#8FA998] w-10 h-10 flex items-center justify-center rounded-xl text-white shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { size: 24 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold tracking-tight text-[#2C3639]", children: "Expenses (Masrufat)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8FA998] font-medium hidden sm:block", children: "Connected to Google Sheets" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setView(view === "input" ? "settings" : "input"),
          className: "p-2 -mr-2 rounded-full hover:bg-[#EFEBE0] text-[#7B8B6F] transition-colors",
          children: view === "input" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { size: 22 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 24 })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 overflow-y-auto px-6 pb-6 pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: view === "input" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { duration: 0.2 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ExpenseForm,
            {
              webhookUrl,
              onRequireSettings: () => setView("settings"),
              onSave: (record) => setHistory((prev) => [record, ...prev])
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RecentHistory, { history })
        ] })
      },
      "input"
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
        transition: { duration: 0.2 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          SettingsPage,
          {
            webhookUrl,
            onSaveUrl: (url) => {
              setWebhookUrl(url);
              localStorage.setItem("sheet-webhook-url", url);
              toast.success("Webhook URL saved");
            }
          }
        ) })
      },
      "settings"
    ) }) })
  ] });
}
function ExpenseForm({
  webhookUrl,
  onRequireSettings,
  onSave
}) {
  const [amount, setAmount] = reactExports.useState("");
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!webhookUrl) {
      toast("Almost there!", {
        description: "You need to connect your Google Sheet first.",
        action: { label: "Setup", onClick: onRequireSettings }
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new URLSearchParams();
      formData.append("amount", amount);
      await fetch(webhookUrl, {
        method: "POST",
        body: formData,
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      toast.success("Saved to Google Sheet!");
      onSave({
        id: Math.random().toString(36).substring(7),
        amount,
        date: (/* @__PURE__ */ new Date()).toISOString()
      });
      setAmount("");
    } catch (err) {
      toast.error("Failed to save. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col space-y-8 bg-white rounded-[32px] shadow-sm border border-[#EFEBE0] p-8 mt-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-[#A5A58D] uppercase tracking-widest mb-3", children: "Transaction Amount" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-light text-[#A5A58D]", children: "IQD" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            step: "1",
            inputMode: "decimal",
            autoFocus: true,
            value: amount,
            onChange: (e) => setAmount(e.target.value),
            placeholder: "0",
            className: "w-full pl-16 py-2 text-6xl font-light border-b-2 border-[#E9EED9] focus:outline-none focus:border-[#8FA998] transition-colors placeholder:text-gray-200 bg-transparent text-[#3D3D3D]"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "submit",
        disabled: isSubmitting || !amount,
        className: cn(
          "w-full py-6 rounded-2xl flex items-center justify-center space-x-3 text-white text-xl font-bold transition-all active:scale-[0.98]",
          isSubmitting || !amount ? "bg-[#A5A58D] cursor-not-allowed opacity-70" : "bg-[#8FA998] hover:bg-[#7D9686] shadow-lg shadow-[#8FA99833]"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isSubmitting ? "Syncing..." : "Sync to Sheet" }),
          !isSubmitting && /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 24 })
        ]
      }
    )
  ] });
}
function RecentHistory({ history }) {
  if (history.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex-1 bg-white rounded-[32px] p-6 border border-[#EFEBE0] flex flex-col shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-[#A5A58D] uppercase tracking-widest mb-4", children: "Last 5 Syncs (Local)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: history.slice(0, 5).map((record) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-3 border-b border-[#F5F5F5] last:border-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-sm text-[#3D3D3D]", children: [
        new Date(record.date).toLocaleDateString(),
        " ",
        new Date(record.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[#6B8E23] font-bold", children: [
        record.amount,
        " IQD"
      ] })
    ] }, record.id)) })
  ] });
}
function SettingsPage({
  webhookUrl,
  onSaveUrl
}) {
  const [urlInput, setUrlInput] = reactExports.useState(webhookUrl);
  const [copied, setCopied] = reactExports.useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(SCRIPT_CODE);
    setCopied(true);
    toast.success("Script copied to clipboard!");
    setTimeout(() => setCopied(false), 2e3);
  }
  function handleSave(e) {
    e.preventDefault();
    if (urlInput && !urlInput.startsWith("https://script.google.com/macros/s/")) {
      toast.error("URL should start with https://script.google.com...");
      return;
    }
    onSaveUrl(urlInput);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 pb-12 bg-white rounded-[32px] shadow-sm border border-[#EFEBE0] p-8 mt-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold tracking-tight text-[#2C3639] mb-2", children: "Setup Guide" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#A5A58D] text-sm leading-relaxed font-medium", children: "Link this app to any Google Sheet. You only need to do this once. Follow the steps below to generate a connection URL." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex bg-[#F8F9F3] p-5 rounded-2xl border border-[#E9EED9]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#8FA998] text-white font-bold mr-4 shadow-sm", children: "1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-[#3D3D3D] mb-1", children: "Create a Sheet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#7B8B6F]", children: "Go to your Google Sheet. Identify the column you want to fill this month (e.g., column H)." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex bg-[#F8F9F3] p-5 rounded-2xl border border-[#E9EED9]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#8FA998] text-white font-bold mr-4 shadow-sm", children: "2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-[#3D3D3D] mb-1", children: "Add Google Apps Script" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-[#7B8B6F] mb-3", children: [
            "In your sheet menu, click ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Extensions > Apps Script" }),
            ". Delete any existing code and paste this:"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "bg-[#2C3639] text-[#EFEBE0] p-4 rounded-xl text-xs overflow-x-auto shadow-inner", children: /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: SCRIPT_CODE }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: handleCopy,
                className: "absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors",
                title: "Copy script",
                children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16, className: "text-[#8FA998]" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 16 })
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex bg-[#F8F9F3] p-5 rounded-2xl border border-[#E9EED9]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#8FA998] text-white font-bold mr-4 shadow-sm", children: "3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-[#3D3D3D] mb-1", children: "Deploy as Web App" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-[#7B8B6F]", children: [
            "Click ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Deploy > New deployment" }),
            " (top right of Apps Script).",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "Select type ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Web app" }),
            ".",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            'Set "Who has access" to ',
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Anyone" }),
            ".",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "Click ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Deploy" }),
            " and copy the resulting Web app URL."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-start space-x-2 text-[#7B8B6F] bg-white p-3 rounded-xl border border-[#E9EED9] text-sm shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 16, className: "mt-0.5 flex-shrink-0 text-[#A5A58D]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: 'Google will ask you to review permissions. It will warn you that the app is unverified. Click "Advanced" > "Go to app (unsafe)" to allow it to edit your sheet.' })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSave, className: "flex flex-col bg-white p-5 rounded-2xl border-2 border-[#8FA998] shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#8FA998] text-white font-bold mr-4 shadow-sm", children: "4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-[#3D3D3D]", children: "Paste your Web app URL" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-12", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: urlInput,
              onChange: (e) => setUrlInput(e.target.value),
              placeholder: "https://script.google.com/macros/s/...",
              className: "w-full px-4 py-3 bg-[#F8F9F3] border border-[#E9EED9] rounded-xl text-sm focus:outline-none focus:border-[#8FA998] text-[#3D3D3D] transition-colors mb-3"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              className: "bg-[#8FA998] hover:bg-[#7D9686] text-white px-5 py-2.5 rounded-xl font-bold transition-colors text-sm shadow-sm",
              children: "Save URL & Connection"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
const EXCHANGE_RATE = 1180;
const PROMO_MULTIPLIER = 0.6;
let workerPromise = null;
const getWorker = () => {
  if (!workerPromise) {
    workerPromise = Tesseract.createWorker("eng");
  }
  return workerPromise;
};
function CalculatorView() {
  const [activeTab, setActiveTab] = reactExports.useState("auto");
  reactExports.useEffect(() => {
    getWorker().catch(console.error);
  }, []);
  const [manualRetail, setManualRetail] = reactExports.useState("");
  const [manualPromo, setManualPromo] = reactExports.useState("");
  const [manualItems, setManualItems] = reactExports.useState("");
  const [autoImage, setAutoImage] = reactExports.useState(null);
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const [autoRetail, setAutoRetail] = reactExports.useState(null);
  const [autoPromo, setAutoPromo] = reactExports.useState(null);
  const [autoItems, setAutoItems] = reactExports.useState(null);
  const [autoError, setAutoError] = reactExports.useState(null);
  const fileInputRef = reactExports.useRef(null);
  const calculateResults = (retail, promo) => {
    const adjustedPromo = promo * PROMO_MULTIPLIER;
    const totalUsd = retail - adjustedPromo;
    const totalIqd = totalUsd * EXCHANGE_RATE;
    return {
      adjustedPromo,
      totalUsd: Math.max(0, totalUsd),
      totalIqd: Math.max(0, totalIqd)
    };
  };
  const processImage = async (file) => {
    try {
      setIsProcessing(true);
      setAutoError(null);
      const imgObj = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = URL.createObjectURL(file);
      });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No canvas context");
      const scale = Math.min(1, 800 / imgObj.width);
      canvas.width = imgObj.width * scale;
      canvas.height = imgObj.height * scale;
      ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const isText = lum < 160 || r > 150 && g < 140 && b < 100;
        const val = isText ? 0 : 255;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
      ctx.putImageData(imgData, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 1);
      const worker = await getWorker();
      const result = await worker.recognize(dataUrl);
      const text = result.data.text;
      let extractedRetail = 0;
      let extractedPromo = 0;
      let extractedEstimated = 0;
      let extractedItems = 0;
      const itemsMatch1 = text.match(/(?:Cart|Checkout)\s*\(\s*(\d+)\s*\)/i);
      const itemsMatch2 = text.match(/(\d+)\s*item(?:s|\(s\))/i);
      if (itemsMatch1) {
        extractedItems = parseInt(itemsMatch1[1], 10);
      } else if (itemsMatch2) {
        extractedItems = parseInt(itemsMatch2[1], 10);
      }
      const normalizedText = text.replace(/\n/g, " ").replace(/\s+/g, " ");
      const parsePrice = (str) => {
        const cleaned = str.replace(/\s/g, "");
        const standardized = cleaned.replace(/[,.](?=\d{2}$)/, ".").replace(/,(?=\d{3})/g, "");
        return parseFloat(standardized) || 0;
      };
      const retailMatch = normalizedText.match(/Retail[^\d]*?([\d,]+[\.,]\s?[\d]{2})/i);
      if (retailMatch) extractedRetail = parsePrice(retailMatch[1]);
      const promoMatch = normalizedText.match(/Promotions?[^\d]*?(?:-)?\s*(?:\$)?\s*([\d,]+[\.,]\s?[\d]{2})/i);
      if (promoMatch) extractedPromo = parsePrice(promoMatch[1]);
      if (!extractedPromo) {
        const savedMatch = normalizedText.match(/Saved[^\d]*?([\d,]+[\.,]\s?[\d]{2})/i);
        if (savedMatch) extractedPromo = parsePrice(savedMatch[1]);
      }
      if (!extractedPromo) {
        const minusMatch = normalizedText.match(/-\s*\$?\s*([\d,]+[\.,]\s?[\d]{2})/);
        if (minusMatch) extractedPromo = parsePrice(minusMatch[1]);
      }
      const estMatch = normalizedText.match(/(?:Estimated|Total)[^\d]*?([\d,]+[\.,]\s?[\d]{2})/i);
      if (estMatch) extractedEstimated = parsePrice(estMatch[1]);
      if (!extractedPromo && extractedRetail && extractedEstimated && extractedRetail > extractedEstimated) {
        extractedPromo = extractedRetail - extractedEstimated;
      }
      extractedRetail = parseFloat(extractedRetail.toFixed(2));
      extractedPromo = parseFloat(extractedPromo.toFixed(2));
      if (!extractedRetail && !extractedPromo) {
        setAutoError("Could not clearly read the prices. Please use Manual Mode.");
        return;
      }
      setAutoRetail(extractedRetail);
      setAutoPromo(extractedPromo);
      setAutoItems(extractedItems || 0);
    } catch (err) {
      console.error(err);
      setAutoError("Failed to process image. Please try again or use manual mode.");
    } finally {
      setIsProcessing(false);
    }
  };
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e2) => {
      setAutoImage(e2.target?.result);
    };
    reader.readAsDataURL(file);
    processImage(file);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAutoImage(event.target?.result);
      };
      reader.readAsDataURL(file);
      processImage(file);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-full bg-gray-100 flex sm:items-start justify-center sm:p-4 font-sans text-gray-900 rounded-xl overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md bg-white sm:rounded-3xl sm:shadow-lg overflow-hidden flex flex-col relative sm:border-[8px] sm:border-gray-800", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-800 text-white pt-8 pb-6 px-6 relative overflow-hidden shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold tracking-tight", children: "Price Calc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "w-5 h-5 text-gray-400" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 pt-6 pb-4 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex p-1 bg-gray-100/80 rounded-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveTab("auto"),
          className: `flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === "auto" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { className: "w-4 h-4" }),
            "Scan"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveTab("manual"),
          className: `flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === "manual" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "w-4 h-4" }),
            "Manual"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto px-6 pb-24", children: [
      activeTab === "auto" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: !autoImage ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "border-2 border-dashed border-gray-200 rounded-2xl p-8 bg-gray-50/50 text-center hover:bg-gray-50 transition-colors cursor-pointer group flex flex-col items-center justify-center min-h-[220px]",
          onClick: () => fileInputRef.current?.click(),
          onDragOver: (e) => e.preventDefault(),
          onDrop: handleDrop,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-105 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-1", children: "Upload Cart Image" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 max-w-xs mx-auto text-xs", children: "Auto-detects retail price and promos" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "file",
                className: "hidden",
                ref: fileInputRef,
                accept: "image/*",
                onChange: handleImageUpload
              }
            )
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 max-h-[200px] flex items-center justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: autoImage,
              alt: "Uploaded cart",
              className: "w-full h-auto object-cover max-h-[200px]"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setAutoImage(null);
                setAutoRetail(null);
                setAutoPromo(null);
                setAutoItems(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              },
              className: "absolute top-3 right-3 bg-gray-900/80 backdrop-blur text-white shadow-sm px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-gray-900 transition-colors",
              children: "Use Different Image"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: isProcessing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "flex flex-col items-center justify-center py-6",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 text-gray-900 animate-spin mb-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 font-medium text-xs", children: "Scanning image..." })
            ]
          },
          "processing"
        ) : autoError ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "flex flex-col items-center justify-center py-6 text-red-500",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-8 h-8 mb-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-center text-xs", children: autoError })
            ]
          },
          "error"
        ) : autoRetail !== null && autoPromo !== null ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            className: "space-y-5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 items-center pb-4 border-b border-gray-100", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider font-semibold block", children: "Retail" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-0 text-gray-400 font-medium", children: "$" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "number",
                        value: autoRetail || "",
                        onChange: (e) => setAutoRetail(parseFloat(e.target.value) || 0),
                        className: "w-full pl-3 py-1 text-base font-bold bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-gray-900 outline-none text-gray-900 transition-colors"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider font-semibold block", children: "Promo" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-0 text-red-400 font-medium", children: "$" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "number",
                        value: autoPromo || "",
                        onChange: (e) => setAutoPromo(parseFloat(e.target.value) || 0),
                        className: "w-full pl-3 py-1 text-base font-bold bg-transparent border-b-2 border-transparent hover:border-red-200 focus:border-red-500 outline-none text-red-500 transition-colors"
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ResultDisplay,
                {
                  retail: autoRetail,
                  promo: autoPromo,
                  items: autoItems || 0,
                  setItems: (v) => setAutoItems(v),
                  calcResult: calculateResults(autoRetail, autoPromo)
                }
              )
            ]
          },
          "results"
        ) : null }) })
      ] }) }),
      activeTab === "manual" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", children: "Retail Price" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-0 text-gray-400 font-medium text-lg", children: "$" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  value: manualRetail,
                  onChange: (e) => setManualRetail(e.target.value),
                  placeholder: "0.00",
                  className: "w-full pl-5 pr-4 py-2 text-xl font-bold bg-transparent border-none focus:ring-0 outline-none text-gray-900 placeholder:text-gray-300"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", children: "Promotion Value" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-0 text-gray-400 font-medium text-lg", children: "$" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  value: manualPromo,
                  onChange: (e) => setManualPromo(e.target.value),
                  placeholder: "0.00",
                  className: "w-full pl-5 pr-4 py-2 text-xl font-bold bg-transparent border-none focus:ring-0 outline-none text-gray-900 placeholder:text-gray-300"
                }
              )
            ] })
          ] })
        ] }),
        manualRetail && manualPromo ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          ResultDisplay,
          {
            retail: parseFloat(manualRetail) || 0,
            promo: parseFloat(manualPromo) || 0,
            items: parseInt(manualItems) || 0,
            setItems: (v) => setManualItems(v.toString()),
            calcResult: calculateResults(parseFloat(manualRetail) || 0, parseFloat(manualPromo) || 0)
          }
        ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-6 text-gray-400 text-sm", children: "Enter both values to calculate" })
      ] })
    ] })
  ] }) });
}
function ResultDisplay({
  retail,
  promo,
  items,
  setItems,
  calcResult
}) {
  const [copied, setCopied] = reactExports.useState(false);
  const [lang, setLang] = reactExports.useState("ku");
  const generateMessage = () => {
    const usd = calcResult.totalUsd.toFixed(2);
    const iqd = calcResult.totalIqd.toLocaleString(void 0, { maximumFractionDigits: 0 });
    const freeShip = calcResult.totalIqd >= 118e3;
    if (lang === "ar") {
      let msg2 = `حضرتك القطع التي أرسلتها سعرها الإجمالي $${usd}
`;
      msg2 += `أي ما يعادل ${iqd} دينار عراقي

`;
      msg2 += `عدد القطع ${items || 0}

`;
      msg2 += `بدون أي إضافات والدولار محسوب على 118 لحضرتك`;
      if (freeShip) {
        msg2 += `
كما أن التوصيل سيكون مجاناً لحضرتك`;
      }
      return msg2;
    }
    let msg = `بەرێزم ئەو پارچانەی ناردووتانە نرخی هەمووەی $${usd}
`;
    msg += `کە دەکاتە ${iqd} IQD

`;
    msg += `ژمارەی پارچەکان ${items || 0}

`;
    msg += `بەبێ ئەوەی هیچ زیادەیەکی بچیتە سەر و دۆلاریش بە 118 هەژمار کراوە بۆتان`;
    if (freeShip) {
      msg += `
هەروەها گەیاندنەکەش دەبیتە خۆرایی لەبۆتان`;
    }
    return msg;
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(generateMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2 text-[10px] text-gray-500 font-medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] text-gray-500 font-semibold uppercase tracking-wider block", children: "Cart Items" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            value: items || "",
            onChange: (e) => setItems(parseInt(e.target.value) || 0),
            className: "w-16 bg-white border border-gray-200 rounded px-2 py-1 text-right font-semibold text-gray-900 outline-none focus:border-gray-900 transition-colors",
            placeholder: "0"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Actual Promo (",
          promo,
          " × ",
          PROMO_MULTIPLIER,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-900", children: [
          "-$",
          calcResult.adjustedPromo.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Formula" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-gray-400", children: [
          retail,
          " - ",
          calcResult.adjustedPromo.toFixed(2)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-900 text-white rounded-2xl p-3 shadow-lg shadow-gray-900/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-gray-400 text-[10px] uppercase tracking-wider font-semibold mb-1", children: "USD Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xl font-bold tracking-tight", children: [
          "$",
          calcResult.totalUsd.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-[#12B76A] text-white rounded-2xl p-3 shadow-lg shadow-[#12B76A]/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-[#D1FADF] text-[10px] uppercase tracking-wider font-semibold mb-1", children: "IQD Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold tracking-tight truncate", children: calcResult.totalIqd.toLocaleString(void 0, { maximumFractionDigits: 0 }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 border-t border-gray-100 pt-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-bold text-gray-900", children: "Customer Message" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex p-0.5 bg-gray-100 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setLang("ku"),
                className: `px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${lang === "ku" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`,
                children: "کوردی"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setLang("ar"),
                className: `px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${lang === "ar" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`,
                children: "عربي"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleCopy,
              className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${copied ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
              children: [
                copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-3 h-3" }),
                copied ? "Copied!" : "Copy"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "bg-gray-50 rounded-xl p-3 text-xs text-gray-700 font-medium leading-relaxed font-sans cursor-pointer hover:bg-gray-100 transition-colors whitespace-pre-wrap border border-gray-100 text-right",
          onClick: handleCopy,
          dir: "rtl",
          children: generateMessage()
        }
      )
    ] })
  ] });
}
const CalculatorModal = ({ monthlyStats, onClose }) => {
  const [selected, setSelected] = reactExports.useState([]);
  const [openYear, setOpenYear] = reactExports.useState(null);
  const toggle = (m) => setSelected((p) => p.includes(m) ? p.filter((x) => x !== m) : [...p, m]);
  const selectAll = () => setSelected(Object.keys(monthlyStats).filter((m) => monthlyStats[m].count > 0));
  const clearAll = () => setSelected([]);
  const totals = reactExports.useMemo(() => {
    let rev = 0, bal = 0, count = 0, buy = 0, wgt = 0, etc = 0, lost = 0;
    selected.forEach((m) => {
      if (monthlyStats[m]) {
        rev += monthlyStats[m].revenue || 0;
        bal += monthlyStats[m].balance || 0;
        count += monthlyStats[m].count || 0;
        buy += monthlyStats[m].buy || 0;
        wgt += monthlyStats[m].wgt || 0;
        etc += monthlyStats[m].etc || 0;
        lost += monthlyStats[m].lost || 0;
      }
    });
    const totalCost = buy + wgt + etc;
    const profit = rev - totalCost - lost;
    return { rev, bal, count, buy, wgt, etc, totalCost, lost, profit };
  }, [selected, monthlyStats]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-foreground/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-slide-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 bg-primary/10 rounded-lg text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { size: 18 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg", children: "Global Ledger" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-1.5 text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: selectAll, className: "text-[10px] font-semibold text-primary hover:underline", children: "Select All" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: clearAll, className: "text-[10px] font-semibold text-muted-foreground hover:underline", children: "Clear" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-48 overflow-y-auto mb-5 space-y-2 custom-scrollbar", children: Object.entries(YEARS_CONFIG).map(([year, months]) => {
      const active = months.filter((m) => monthlyStats[m]?.count > 0);
      if (!active.length) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setOpenYear(openYear === year ? null : year), className: `w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-all ${openYear === year ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`, children: year }),
        openYear === year && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-1.5 mt-2", children: active.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggle(m), className: `py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${selected.includes(m) ? "bg-primary border-primary text-primary-foreground" : "bg-secondary border-border text-muted-foreground"}`, children: m }, m)) })
      ] }, year);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary p-4 rounded-xl space-y-3 mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-3 rounded-lg border border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-medium mb-0.5", children: "Total Orders" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold", children: totals.count.toLocaleString() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-3 rounded-lg border border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-medium mb-0.5", children: "Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold", children: totals.rev.toLocaleString() })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-3 rounded-lg border border-border space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Buying Cost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive font-mono font-semibold", children: totals.buy.toLocaleString() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Weight/Ship" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive font-mono font-semibold", children: totals.wgt.toLocaleString() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Other" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive font-mono font-semibold", children: totals.etc.toLocaleString() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-2 flex justify-between text-xs font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total Cost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: totals.totalCost.toLocaleString() })
        ] }),
        totals.lost > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Lost (K3)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive font-mono font-semibold", children: totals.lost.toLocaleString() })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground font-medium mb-0.5", children: "Net Profit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-2xl font-bold font-mono ${totals.profit >= 0 ? "text-primary" : "text-destructive"}`, children: [
          totals.profit.toLocaleString(),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "IQD" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground font-medium mb-0.5", children: "Combined Balance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-3xl font-bold text-primary font-mono", children: [
          totals.bal.toLocaleString(),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "IQD" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "w-full bg-foreground hover:bg-foreground/90 text-background font-semibold py-3 rounded-lg transition-all text-sm", children: "Close" })
  ] }) });
};
const getImageHash = async (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 8;
      canvas.height = 8;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No context");
      ctx.drawImage(img, 0, 0, 8, 8);
      try {
        const imgData = ctx.getImageData(0, 0, 8, 8);
        let sum = 0;
        const grayscale = [];
        for (let i = 0; i < imgData.data.length; i += 4) {
          const val = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
          grayscale.push(val);
          sum += val;
        }
        const avg = sum / grayscale.length;
        let hash = "";
        for (let i = 0; i < grayscale.length; i++) {
          hash += grayscale[i] >= avg ? "1" : "0";
        }
        resolve(hash);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};
const hammingDistance = (hash1, hash2) => {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return 999;
  let dist = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) dist++;
  }
  return dist;
};
const CameraSearchModal = ({ allOrders, onOrderClick, onClose }) => {
  const [capturedImage, setCapturedImage] = reactExports.useState(null);
  const [filterText, setFilterText] = reactExports.useState("");
  const [isComparing, setIsComparing] = reactExports.useState(false);
  const [targetHash, setTargetHash] = reactExports.useState(null);
  const [hashedOrders, setHashedOrders] = reactExports.useState(/* @__PURE__ */ new Map());
  const fileRef = reactExports.useRef(null);
  const cameraRef = reactExports.useRef(null);
  React__default.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result;
        setCapturedImage(dataUrl);
        setIsComparing(true);
        try {
          const hash = await getImageHash(dataUrl);
          setTargetHash(hash);
        } catch (err) {
          console.error("Failed to hash uploaded image", err);
          alert("Failed to process uploaded image.");
        } finally {
          setIsComparing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const baseOrdersWithImages = reactExports.useMemo(() => {
    let list = allOrders.filter((o) => o.imageBase64 || o.image_url || o.warningBase64 || o.secondaryImages && o.secondaryImages.length > 0 || o.proof_urls || o.primary_urls);
    return list.sort((a, b) => Number(b.id) - Number(a.id));
  }, [allOrders]);
  const ordersWithImages = reactExports.useMemo(() => {
    let list = baseOrdersWithImages;
    if (filterText) {
      const q = filterText.toLowerCase();
      list = list.filter((o) => [o.insta, o.name, o.phone, o.place, o.box_name, o.sheet_name].some((f) => String(f || "").toLowerCase().includes(q)));
    }
    return list;
  }, [baseOrdersWithImages, filterText]);
  reactExports.useEffect(() => {
    if (!targetHash) return;
    let isActive = true;
    const hashImages = async () => {
      setIsComparing(true);
      const newHashes = new Map(hashedOrders);
      for (const order of baseOrdersWithImages) {
        if (!isActive) break;
        const key = `${order.id}-${order.sheet_name}`;
        if (newHashes.has(key)) continue;
        const srcs = [];
        if (order.imageBase64) srcs.push(order.imageBase64.startsWith("data:") ? order.imageBase64 : `data:image/jpeg;base64,${order.imageBase64}`);
        if (order.image_url) srcs.push(order.image_url);
        if (order.secondaryImages) {
          order.secondaryImages.forEach((img) => srcs.push(img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}`));
        }
        if (order.proof_urls) {
          String(order.proof_urls).split(",").filter(Boolean).forEach((url) => srcs.push(url));
        }
        if (order.primary_urls) {
          String(order.primary_urls).split(",").filter(Boolean).forEach((url) => srcs.push(url));
        }
        const hashes = [];
        for (const src of srcs) {
          try {
            const h = await getImageHash(src);
            hashes.push(h);
          } catch (e) {
          }
        }
        newHashes.set(key, hashes);
        await new Promise((r) => setTimeout(r, 10));
      }
      if (isActive) {
        setHashedOrders(newHashes);
        setIsComparing(false);
      }
    };
    hashImages();
    return () => {
      isActive = false;
    };
  }, [baseOrdersWithImages, targetHash]);
  const displayedOrders = reactExports.useMemo(() => {
    let list = ordersWithImages;
    if (targetHash) {
      list = list.filter((order) => {
        const key = `${order.id}-${order.sheet_name}`;
        const hashes = hashedOrders.get(key) || [];
        return hashes.some((h) => hammingDistance(targetHash, h) <= 12);
      });
    }
    return list;
  }, [ordersWithImages, targetHash, hashedOrders]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-[100] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-foreground/30 backdrop-blur-sm", onClick: onClose }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 bg-card w-full h-full flex flex-col max-w-4xl mx-auto lg:my-4 lg:rounded-2xl lg:max-h-[calc(100vh-2rem)] lg:border lg:border-border lg:shadow-2xl overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border flex items-center justify-between bg-secondary/50 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-muted-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg", children: "📷 Image Search" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "Find orders by comparing proof & warning images" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-muted-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border bg-card shrink-0 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => cameraRef.current?.click(), className: "flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-colors text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 18 }),
            " Take Photo"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => fileRef.current?.click(), className: "flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 rounded-xl transition-colors text-sm border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 18 }),
            " Upload"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: cameraRef, type: "file", accept: "image/*", capture: "environment", onChange: handleFile, className: "hidden" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", accept: "image/*", onChange: handleFile, className: "hidden" }),
        capturedImage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: capturedImage, alt: "Captured", className: "w-full max-h-48 object-contain rounded-xl border border-border bg-secondary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setCapturedImage(null);
            setTargetHash(null);
            setFilterText("");
          }, className: "absolute top-2 right-2 p-1 bg-foreground/70 text-background rounded-full hover:bg-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) }),
          isComparing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-primary flex items-center justify-center gap-1 mt-1 font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin" }),
            " Scanning images for match..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-1 text-center", children: "Showing best matches below" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative border-t border-border pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-[calc(50%+6px)] -translate-y-1/2 text-muted-foreground", size: 16 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: filterText,
              onChange: (e) => setFilterText(e.target.value),
              placeholder: "Filter by name, phone, box...",
              className: "w-full bg-secondary border border-border text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/50 font-medium"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 custom-scrollbar", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-end mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-medium", children: [
            displayedOrders.length,
            " ",
            targetHash && !isComparing ? "matching " : "",
            "orders found"
          ] }),
          isComparing && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-primary flex items-center gap-1 font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin" }),
            " Processing"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3", children: displayedOrders.map((order) => {
          const key = `${order.id}-${order.sheet_name}`;
          const formatImg = (img) => {
            if (!img) return null;
            if (img.startsWith("http") || img.startsWith("data:")) return img;
            if (img.length > 100) return `data:image/jpeg;base64,${img}`;
            return img;
          };
          const imgB64 = typeof order.imageBase64 === "string" ? order.imageBase64 : "";
          const warnB64 = typeof order.warningBase64 === "string" ? order.warningBase64 : "";
          const primaryUrl1 = order.primary_urls ? String(order.primary_urls).split(",").filter(Boolean)[0] : "";
          const proofUrl1 = order.proof_urls ? String(order.proof_urls).split(",").filter(Boolean)[0] : "";
          const proofSrc = formatImg(proofUrl1) || (imgB64 ? formatImg(imgB64) : order.image_url || null);
          const primarySrc = formatImg(primaryUrl1);
          const warningSrc = formatImg(warnB64);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => onOrderClick(order), className: "bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-0.5", children: [
              proofSrc && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square bg-secondary flex items-center justify-center overflow-hidden relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: proofSrc, alt: "Proof", referrerPolicy: "no-referrer", className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1 left-1 bg-primary/80 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded", children: "PROOF" })
              ] }),
              primarySrc && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square bg-secondary flex items-center justify-center overflow-hidden relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: primarySrc, alt: "Primary", referrerPolicy: "no-referrer", className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1 left-1 bg-primary/80 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded", children: "PRIMARY" })
              ] }),
              warningSrc && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square bg-secondary flex items-center justify-center overflow-hidden relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: warningSrc, alt: "Warning", referrerPolicy: "no-referrer", className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1 left-1 bg-amber-500/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded", children: "WARNING" })
              ] }),
              order.secondaryImages?.map((img, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square bg-secondary flex items-center justify-center overflow-hidden relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}`, alt: `Proof ${i + 2}`, referrerPolicy: "no-referrer", className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute top-1 left-1 bg-primary/60 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded", children: [
                  "+",
                  i + 1
                ] })
              ] }, i)),
              !proofSrc && !primarySrc && !warningSrc && !order.secondaryImages?.length && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square bg-secondary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl opacity-20", children: "👕" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-1 mb-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-xs truncate flex-1", children: order.name || order.insta || "-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary font-bold text-xs whitespace-nowrap", children: Number(String(order.price).replace(/[^0-9.-]+/g, "")).toLocaleString() })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "#",
                  order.id,
                  " · ",
                  order.sheet_name
                ] }),
                order.box_name && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary", children: [
                  "📦 ",
                  order.box_name
                ] })
              ] })
            ] })
          ] }, key);
        }) }),
        displayedOrders.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-16 text-center", children: isComparing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 animate-spin mx-auto text-primary mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Scanning images..." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl mb-3 opacity-30", children: "📷" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: targetHash ? "No exact matches found" : "No orders with images found" })
        ] }) })
      ] })
    ] })
  ] });
};
function UserProfileModal({ userTarget, onClose, onMessage, allOrders, canDelete, profileMode = "kurdistani", onOrderClick }) {
  const [stats, setStats] = reactExports.useState({
    totalOrders: 0,
    todayOrders: 0,
    totalValue: 0,
    isActiveToday: false,
    isOnline: false,
    recentOrders: [],
    bySource: []
  });
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    let unsubscribe = () => {
    };
    try {
      unsubscribe = onSnapshot(collection(db, "user_stats"), (snapshot) => {
        const rawStats = {};
        snapshot.forEach((docSnap) => {
          rawStats[docSnap.id] = docSnap.data();
        });
        setStats(getUserStatsForProfile(rawStats, userTarget.username, profileMode));
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } catch (err) {
      setLoading(false);
    }
    return () => unsubscribe();
  }, [userTarget.username, profileMode]);
  const { isActiveToday, isOnline, bySource } = stats;
  const recentOrders = stats.recentOrders.filter((order) => allOrders.some((o) => String(o.id) === String(order.id) && o.sheet_name === order.sheet));
  const todayKey = (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Asia/Baghdad" });
  const totalOrders = recentOrders.length;
  const todayOrders = recentOrders.filter((order) => order.createdAt && new Date(order.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Baghdad" }) === todayKey).length;
  const totalValue = recentOrders.reduce((sum, order) => sum + parseOrderPrice(order.price), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl border overflow-hidden flex flex-col", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-24 bg-gradient-to-r from-primary/80 to-primary flex items-center justify-between px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-1.5 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20 rounded-full transition-colors self-start mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 pb-6 relative overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 bg-background rounded-full p-1.5 absolute -top-10 left-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-8 w-8 text-primary" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xl font-bold flex items-center gap-2", children: [
          userTarget.username,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-bold tracking-wider", children: userTarget.role })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground flex items-center gap-1.5 mt-1", children: isOnline ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-green-500 animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600 dark:text-green-500 font-medium", children: "Online Now" })
        ] }) : isActiveToday ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-blue-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-600 dark:text-blue-500 font-medium", children: "Active Today" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-muted-foreground/40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Inactive Today" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/50 p-3 rounded-xl border border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground flex items-center gap-1.5 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4" }),
            " Total Orders"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: totalOrders })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/50 p-3 rounded-xl border border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground flex items-center gap-1.5 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4" }),
            " Today"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: todayOrders })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/50 p-3 rounded-xl border border-border/50 col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground flex items-center gap-1.5 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-4 w-4" }),
            " ",
            profileMode === "all" ? "Combined Value" : "Total Value"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold", children: [
            totalValue.toLocaleString(),
            " IQD"
          ] })
        ] })
      ] }),
      profileMode === "all" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 mt-3", children: bySource.map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-3 ${SOURCE_STYLES[entry.source].badge}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-bold uppercase tracking-wider", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-2.5 w-2.5 rounded-full ${SOURCE_STYLES[entry.source].dot}` }),
          SOURCE_STYLES[entry.source].label
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-sm font-semibold", children: [
          entry.totalOrders,
          " orders"
        ] })
      ] }, entry.source)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4" }),
            " ",
            profileMode === "all" ? "Combined Orders" : "Orders"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            recentOrders.length,
            " tracked"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-72 overflow-y-auto pr-1", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground py-4", children: "Loading profile..." }) : recentOrders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground py-4", children: "No tracked orders yet." }) : recentOrders.map((order) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              const match = allOrders.find((o) => String(o.id) === String(order.id) && o.sheet_name === order.sheet);
              if (match) {
                onClose();
                onOrderClick?.(match);
              }
            },
            className: `w-full border rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent ${profileMode === "all" ? `border-l-4 ${SOURCE_STYLES[order.source].row}` : "bg-card"}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold truncate", children: [
                  "@",
                  order.insta
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground truncate", children: [
                  "#",
                  order.id,
                  " · ",
                  order.sheet
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold", children: [
                  parseOrderPrice(order.price).toLocaleString(),
                  " IQD"
                ] }),
                profileMode === "all" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${SOURCE_STYLES[order.source].badge}`, children: SOURCE_STYLES[order.source].label })
              ] })
            ] })
          },
          `${order.source}-${order.sheet}-${order.id}-${order.createdAt}`
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex space-x-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "flex-1 rounded-xl", onClick: onMessage, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4 mr-2" }),
        " Message"
      ] }) })
    ] })
  ] }) });
}
function MessagesView({ role, allOrders = [], profileMode = "kurdistani" }) {
  const [messages, setMessages] = reactExports.useState([]);
  const [topics, setTopics] = reactExports.useState([{ id: "general", name: "General", createdAt: null }]);
  const [users, setUsers] = reactExports.useState([]);
  const [newMessage, setNewMessage] = reactExports.useState("");
  const [topic, setTopic] = reactExports.useState("general");
  const [uploading, setUploading] = reactExports.useState(false);
  const [newTopicName, setNewTopicName] = reactExports.useState("");
  const [mobileView, setMobileView] = reactExports.useState("sidebar");
  const messagesEndRef = reactExports.useRef(null);
  const [lastRead, setLastRead] = reactExports.useState(() => {
    try {
      return JSON.parse(localStorage.getItem("messages_last_read") || "{}");
    } catch {
      return {};
    }
  });
  const [unreadCounts, setUnreadCounts] = reactExports.useState({});
  const [profileTarget, setProfileTarget] = reactExports.useState(null);
  const [isRecording, setIsRecording] = reactExports.useState(false);
  const [recordingDuration, setRecordingDuration] = reactExports.useState(0);
  const mediaRecorderRef = reactExports.useRef(null);
  const audioChunksRef = reactExports.useRef([]);
  const timerRef = reactExports.useRef(null);
  const currentUser = localStorage.getItem("auth_username") || role;
  const getMediaType = (mimeType = "", fileName = "") => {
    const lowerName = fileName.toLowerCase();
    if (mimeType.startsWith("image/") || /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(lowerName)) return "image";
    if (mimeType.startsWith("audio/") || /\.(webm|mp3|wav|ogg|m4a|aac)$/i.test(lowerName)) return "audio";
    if (mimeType.startsWith("video/") || /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(lowerName)) return "video";
    return "file";
  };
  const getSupportedAudioMimeType = () => {
    const options = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus"
    ];
    return options.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  };
  const getExtensionFromMimeType = (mimeType) => {
    if (mimeType.includes("mp4")) return "m4a";
    if (mimeType.includes("ogg")) return "ogg";
    if (mimeType.includes("mpeg")) return "mp3";
    if (mimeType.includes("wav")) return "wav";
    return "webm";
  };
  const sendAttachmentMessage = async (downloadURL, fileName, mimeType) => {
    await addDoc(collection(db, `topics/${topic}/messages`), {
      text: "",
      imageUrl: downloadURL,
      mediaType: getMediaType(mimeType, fileName),
      mimeType,
      fileName,
      senderId: currentUser,
      senderRole: role,
      createdAt: serverTimestamp(),
      topicId: topic
    });
    const topicDisplay = topic.startsWith("dm_") ? `DM with ${topic.replace("dm_", "").replace(currentUser.toLowerCase(), "").replace("_", "")}` : void 0;
    await updateTopicLastMessage(topic, topicDisplay);
  };
  reactExports.useEffect(() => {
    localStorage.setItem("messages_last_read", JSON.stringify(lastRead));
  }, [lastRead]);
  reactExports.useEffect(() => {
    if (window.location.hash && window.location.hash.startsWith("#messages:")) {
      const t = window.location.hash.replace("#messages:", "");
      setTopic(t);
      setMobileView("chat");
      window.location.hash = "";
    }
  }, []);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    const container = document.getElementById("chat-messages-container");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };
  reactExports.useEffect(() => {
    scrollToBottom();
  }, [messages, mobileView]);
  reactExports.useEffect(() => {
    ensureBrowserNotificationPermission();
  }, []);
  reactExports.useEffect(() => {
    const q = query(collection(db, "topics"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTopics = snapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
      if (!fetchedTopics.find((t) => t.id === "general")) {
        fetchedTopics.push({ id: "general", name: "General", createdAt: null });
      }
      fetchedTopics.sort((a, b) => {
        const timeA = a.lastMessageAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
        const timeB = b.lastMessageAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      setTopics(fetchedTopics);
      fetchedTopics.forEach((t) => {
        if (t.lastMessageAt?.toMillis && t.lastMessageAt.toMillis() > (lastRead[t.id] || 0)) {
          setUnreadCounts((prev) => ({ ...prev, [t.id]: true }));
        }
      });
    });
    return () => unsubscribe();
  }, [lastRead]);
  reactExports.useEffect(() => {
    const q = query(collection(db, `topics/${topic}/messages`), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const msg = change.doc.data();
          if (msg.senderId !== currentUser && msg.createdAt?.toMillis && Date.now() - msg.createdAt.toMillis() < 1e4) {
            showBrowserNotification(`New message from ${msg.senderId}`, {
              body: msg.text || "Sent an attachment",
              icon: msg.imageUrl || "/logo.jpg",
              tag: `message-${topic}-${change.doc.id}`
            });
          }
        }
      });
      const msgs = snapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
      setMessages(msgs);
      setTimeout(() => scrollToBottom(), 100);
      if (msgs.length > 0) {
        setLastRead((prev) => ({ ...prev, [topic]: Date.now() }));
        setUnreadCounts((prev) => ({ ...prev, [topic]: false }));
      }
    });
    return () => unsubscribe();
  }, [topic, currentUser]);
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTopicName.trim() || !["owner", "admin"].includes(role)) return;
    const id = newTopicName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    await setDoc(doc(db, "topics", id), {
      name: newTopicName.trim(),
      createdAt: serverTimestamp(),
      lastMessageAt: serverTimestamp()
    });
    setNewTopicName("");
    setTopic(id);
    toast.success("Topic created!");
  };
  const updateTopicLastMessage = async (topicId, topicName) => {
    try {
      await setDoc(doc(db, "topics", topicId), {
        lastMessageAt: serverTimestamp(),
        ...topicName ? { name: topicName } : {}
      }, { merge: true });
    } catch {
    }
  };
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() && !uploading) return;
    await addDoc(collection(db, `topics/${topic}/messages`), {
      text: newMessage.trim(),
      senderId: currentUser,
      senderRole: role,
      createdAt: serverTimestamp(),
      topicId: topic
    });
    const topicDisplay = topic.startsWith("dm_") ? `DM with ${topic.replace("dm_", "").replace(currentUser.toLowerCase(), "").replace("_", "")}` : void 0;
    await updateTopicLastMessage(topic, topicDisplay);
    setNewMessage("");
  };
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    let downloadURL = "";
    try {
      if (file.type.startsWith("image/")) {
        downloadURL = await uploadToImgBB(file);
      } else {
        const storageRef = ref(storage, `messages/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file, {
          contentType: file.type || "application/octet-stream"
        });
        downloadURL = await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
            },
            (error) => {
              reject(error);
            },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });
      }
      await sendAttachmentMessage(downloadURL, file.name, file.type);
      setUploading(false);
      e.target.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
      setUploading(false);
      e.target.value = "";
    }
  };
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        toast.error("Voice recording is not supported in this browser");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedAudioMimeType();
      mediaRecorderRef.current = new MediaRecorder(stream, mimeType ? { mimeType } : void 0);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        const recordedMimeType = mediaRecorderRef.current?.mimeType || mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: recordedMimeType });
        if (audioBlob.size === 0) {
          toast.error("No audio was recorded");
          return;
        }
        setUploading(true);
        try {
          const fileName = `voice_${Date.now()}.${getExtensionFromMimeType(recordedMimeType)}`;
          const storageRef = ref(storage, `messages/${fileName}`);
          const snapshot = await uploadBytes(storageRef, audioBlob, {
            contentType: recordedMimeType
          });
          const downloadURL = await getDownloadURL(snapshot.ref);
          await sendAttachmentMessage(downloadURL, fileName, recordedMimeType);
          setUploading(false);
        } catch (err) {
          console.error(err);
          toast.error("Audio upload failed");
          setUploading(false);
        }
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1e3);
    } catch (err) {
      console.error("Mic access denied", err);
      toast.error(`Mic access denied: ${err?.message || "Unknown error"}`);
      toast.info("Please open the app in a new tab (button top right) and ensure microphone permissions are granted.", { duration: 8e3 });
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };
  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  const getDMTopicId = (u1, u2) => {
    return `dm_${[u1, u2].sort().join("_")}`;
  };
  const handleDeleteTopic = async (topicId, e) => {
    e.stopPropagation();
    const isParticipant = topicId.startsWith("dm_") && topicId.includes(currentUser.toLowerCase());
    if (!["owner", "admin"].includes(role) && !isParticipant) return;
    if (window.confirm("Are you sure you want to delete this chat and all its messages?")) {
      try {
        await deleteDoc(doc(db, "topics", topicId));
        if (topic === topicId) setTopic("general");
        toast.success("Topic deleted");
      } catch (err) {
        toast.error("Failed to delete topic");
      }
    }
  };
  const handleDeleteMessage = async (msgId, senderId) => {
    if (senderId !== currentUser && !["owner", "admin"].includes(role)) return;
    if (window.confirm("Delete this message?")) {
      try {
        await deleteDoc(doc(db, `topics/${topic}/messages`, msgId));
      } catch (err) {
        toast.error("Failed to delete message");
      }
    }
  };
  const getTopicDisplayName = () => {
    if (topic.startsWith("dm_")) {
      return `@ ${topic.replace("dm_", "").replace(currentUser, "").replace("_", "")}`;
    }
    return `# ${topics.find((t) => t.id === topic)?.name || topic}`;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full max-w-6xl mx-auto bg-card md:rounded-xl md:border shadow-sm overflow-hidden text-sm md:text-base", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${mobileView === "sidebar" ? "flex" : "hidden"} md:flex w-full md:w-64 border-r bg-muted/20 flex-col h-full overflow-hidden shrink-0`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold text-lg flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-5 w-5" }),
        " Topics"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-2 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2", children: "Channels" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: topics.filter((t) => !t.id.startsWith("dm_")).map((t, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `w-full group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${topic === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`,
              onClick: () => {
                setTopic(t.id);
                setMobileView("chat");
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
                  "# ",
                  t.name
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  unreadCounts[t.id] && topic !== t.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full bg-red-500 shrink-0" }),
                  ["owner", "admin"].includes(role) && t.id !== "general" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Trash2,
                    {
                      className: "h-3.5 w-3.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity",
                      onClick: (e) => handleDeleteTopic(t.id, e)
                    }
                  )
                ] })
              ]
            },
            `topic-${t.id}-${idx}`
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2", children: "Direct Messages" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: topics.filter((t) => t.id.startsWith("dm_")).map((t, idx) => {
            const displayName = `@ ${t.id.replace("dm_", "").replace(currentUser.toLowerCase(), "").replace("_", "")}`;
            if (!t.id.includes(currentUser.toLowerCase()) && role !== "owner") return null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `w-full group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${topic === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`,
                onClick: () => {
                  setTopic(t.id);
                  setMobileView("chat");
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: displayName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    unreadCounts[t.id] && topic !== t.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full bg-red-500 shrink-0" }),
                    (["owner", "admin"].includes(role) || t.id.includes(currentUser.toLowerCase())) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Trash2,
                      {
                        className: "h-3.5 w-3.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity",
                        onClick: (e) => handleDeleteTopic(t.id, e)
                      }
                    )
                  ] })
                ]
              },
              `topic-dm-${t.id}-${idx}`
            );
          }) })
        ] })
      ] }),
      ["owner", "admin"].includes(role) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateTopic, className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: newTopicName,
            onChange: (e) => setNewTopicName(e.target.value),
            placeholder: "New topic...",
            className: "h-9"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "icon", className: "h-9 w-9 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${mobileView === "chat" ? "flex" : "hidden"} md:flex flex-1 flex-col min-w-0 relative`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-0 p-4 border-b bg-background/95 backdrop-blur flex justify-between items-center shadow-sm z-50 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setMobileView("sidebar"),
            className: "md:hidden p-1 -ml-2 mr-1 text-muted-foreground hover:bg-muted rounded",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-5 w-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold text-lg truncate flex items-center gap-2", children: [
          topic.startsWith("dm_") ? /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-5 w-5 shrink-0" }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: getTopicDisplayName() })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4", id: "chat-messages-container", children: [
        messages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex items-center justify-center text-muted-foreground italic flex-col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-10 w-10 opacity-20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No messages yet." }),
          topic.startsWith("dm_") && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm border bg-muted/50 px-3 py-1 rounded-full", children: "Say hi to start the conversation!" })
        ] }) : messages.map((msg, idx) => {
          const isMe = msg.senderId === currentUser;
          const canDelete = isMe || ["owner", "admin"].includes(role);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex flex-col ${isMe ? "items-end" : "items-start"} group w-full`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "text-xs text-muted-foreground mb-1 cursor-pointer hover:underline flex items-center gap-1",
                onClick: () => setProfileTarget({ username: msg.senderId, role: msg.senderRole }),
                children: [
                  !isMe && /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3" }),
                  msg.senderId,
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-70", children: [
                    "(",
                    msg.senderRole,
                    ")"
                  ] }),
                  isMe && /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} max-w-[85%]`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl px-4 py-2.5 shadow-sm text-sm ${isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"}`, children: [
                msg.text && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap break-words leading-relaxed", children: msg.text }),
                msg.imageUrl && ((msg.mediaType || getMediaType(msg.mimeType, msg.fileName || msg.imageUrl)) === "audio" ? /* @__PURE__ */ jsxRuntimeExports.jsx("audio", { src: msg.imageUrl, controls: true, className: "mt-2 max-w-[200px]" }) : (msg.mediaType || getMediaType(msg.mimeType, msg.fileName || msg.imageUrl)) === "video" ? /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: msg.imageUrl, controls: true, className: "rounded-lg mt-2 max-w-full max-h-64" }) : (msg.mediaType || getMediaType(msg.mimeType, msg.fileName || msg.imageUrl)) === "image" || msg.imageUrl.includes("alt=media") ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: msg.imageUrl, alt: "attachment", referrerPolicy: "no-referrer", className: "rounded-lg mt-2 max-w-full max-h-64 object-contain" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: msg.imageUrl, target: "_blank", rel: "noopener noreferrer", className: `underline text-sm mt-2 block break-all flex items-center gap-1 ${isMe ? "text-primary-foreground/80" : "text-primary/80"}`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-3 w-3" }),
                  " View Attachment"
                ] }))
              ] }),
              canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => handleDeleteMessage(msg.id, msg.senderId),
                  className: "opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all shrink-0",
                  title: "Delete message",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                }
              )
            ] })
          ] }, `msg-${msg.id}-${idx}`);
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: messagesEndRef })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 bg-background border-t", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSend, className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "cursor-pointer p-2 hover:bg-muted rounded-full transition-colors relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", className: "hidden", accept: "*/*", onChange: handleImageUpload, disabled: uploading }),
          uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-5 w-5 text-muted-foreground" })
        ] }),
        isRecording ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex items-center gap-3 bg-red-50 text-red-500 rounded-full px-4 h-10 border border-red-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium font-mono text-sm", children: formatDuration(recordingDuration) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm opacity-80 flex-1", children: "Recording..." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: newMessage,
            onChange: (e) => setNewMessage(e.target.value),
            placeholder: `Message ${getTopicDisplayName()}...`,
            className: "flex-1 rounded-full bg-muted/50 border-transparent focus-visible:bg-background",
            disabled: uploading
          }
        ),
        newMessage.trim() === "" && !uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            size: "icon",
            variant: isRecording ? "destructive" : "secondary",
            className: "rounded-full shrink-0 transition-colors",
            onClick: isRecording ? stopRecording : startRecording,
            children: isRecording ? /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-4 w-4" })
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "icon", className: "rounded-full shrink-0", disabled: !newMessage.trim() && !uploading, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
      ] }) })
    ] }),
    profileTarget && /* @__PURE__ */ jsxRuntimeExports.jsx(
      UserProfileModal,
      {
        userTarget: profileTarget,
        allOrders,
        profileMode,
        onClose: () => setProfileTarget(null),
        onMessage: () => {
          setTopic(getDMTopicId(currentUser, profileTarget.username));
          setProfileTarget(null);
          setMobileView("chat");
        }
      }
    )
  ] });
}
function TeamView({ role, allOrders = [], currentUser, profileMode = "kurdistani", onOrderClick }) {
  const [users, setUsers] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [search, setSearch] = reactExports.useState("");
  const [profileTarget, setProfileTarget] = reactExports.useState(null);
  const [stats, setStats] = reactExports.useState({});
  const canViewLiveStats = role === "owner" || role === "admin";
  reactExports.useEffect(() => {
    if (!canViewLiveStats) return;
    let unsubscribe = () => {
    };
    import("../_libs/firebase.mjs").then(({ collection: collection2, onSnapshot: onSnapshot2 }) => {
      import("./GlobalCalculator-qKTf8MtO.mjs").then((n) => n.n).then(({ db: db2 }) => {
        unsubscribe = onSnapshot2(collection2(db2, "user_stats"), (snapshot) => {
          const newStats = {};
          snapshot.forEach((doc2) => {
            const data = doc2.data();
            newStats[doc2.id] = data;
            if (data.username && data.profile) newStats[`${data.profile}_${normalizeTeamUsername(data.username)}`] = data;
          });
          setStats(newStats);
        }, (err) => {
          console.error("Failed to fetch user stats", err);
        });
      });
    });
    return () => unsubscribe();
  }, [canViewLiveStats]);
  reactExports.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsers(await fetchCombinedAuthUsers(fetchWithRetry, profileMode));
      } catch (e) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [profileMode]);
  const filtered = users.filter((u) => {
    return String(u?.username || "").toLowerCase().includes(search.toLowerCase()) || String(u?.role || "").toLowerCase().includes(search.toLowerCase());
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-6 w-6 text-primary" }),
          "Team Directory"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "View profiles, access, and send messages." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-64", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: search,
            onChange: (e) => setSearch(e.target.value),
            className: "w-full pl-9 pr-4 py-2 bg-card border rounded-lg text-sm",
            placeholder: "Search team..."
          }
        )
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-32 bg-card animate-pulse rounded-xl border" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: filtered.map((u, i) => {
      const profileStats = getUserStatsForProfile(stats, u.username, profileMode);
      const visibleOrders = profileStats.recentOrders.filter((order) => allOrders.some((o) => String(o.id) === String(order.id) && o.sheet_name === order.sheet));
      const recentOrders = visibleOrders.slice(0, 3);
      const todayKey = (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Asia/Baghdad" });
      const visibleTodayOrders = visibleOrders.filter((order) => order.createdAt && new Date(order.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Baghdad" }) === todayKey).length;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => setProfileTarget(u), className: "bg-card hover:bg-accent/50 transition-colors border rounded-xl p-4 cursor-pointer flex flex-col gap-3 group relative shadow-sm", children: [
        canViewLiveStats && profileStats.isOnline && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { title: "Online Now", className: "absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-sm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-6 w-6 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 pr-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg truncate", children: u.username }),
              u.username === currentUser && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase font-bold tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded", children: "You" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3 w-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "uppercase", children: u.role })
            ] })
          ] })
        ] }),
        canViewLiveStats && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mt-2 pt-3 border-t", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-3 w-3" }),
                " Today"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-lg leading-none", children: visibleTodayOrders })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-3 w-3" }),
                " Total"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-lg leading-none", children: visibleOrders.length })
            ] })
          ] }),
          recentOrders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5 pt-2 border-t", children: recentOrders.map((order) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: (event) => {
                event.stopPropagation();
                const match = allOrders.find((o) => String(o.id) === String(order.id) && o.sheet_name === order.sheet);
                if (match) onOrderClick?.(match);
              },
              className: "flex w-full items-center justify-between gap-2 rounded-md px-1 py-0.5 text-left text-xs hover:bg-accent",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate text-muted-foreground", children: [
                  "@",
                  order.insta
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `shrink-0 rounded-full border px-1.5 py-0.5 font-semibold ${profileMode === "all" ? SOURCE_STYLES[order.source].badge : "bg-muted text-muted-foreground border-border"}`, children: order.sheet })
              ]
            },
            `${order.id}-${order.createdAt}`
          )) })
        ] })
      ] }, i);
    }) }),
    profileTarget && /* @__PURE__ */ jsxRuntimeExports.jsx(
      UserProfileModal,
      {
        userTarget: profileTarget,
        allOrders,
        profileMode,
        onOrderClick,
        onClose: () => setProfileTarget(null),
        onMessage: () => {
          const dmTopic = `dm_${[currentUser.toLowerCase(), profileTarget.username.toLowerCase()].sort().join("_")}`;
          window.location.hash = `messages:${dmTopic}`;
        }
      }
    )
  ] });
}
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
      const normalizedUsername = username.toLowerCase().trim();
      const loginAgainst = async (url) => {
        const payload = new URLSearchParams();
        payload.append("action", "login");
        payload.append("username", username);
        payload.append("password", password);
        try {
          const res = await fetchWithRetry(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: payload.toString()
          });
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch (parseError) {
            console.log("Backend did not return JSON, using fallback mode");
            return { status: "error", message: "Backend not updated" };
          }
        } catch (networkError) {
          console.log("Network error, using fallback mode");
          return { status: "error", message: "Network error" };
        }
      };
      let data = await loginAgainst(SCRIPT_URL);
      let targetSystem = data.system || data.profile || "kurdistani";
      if (data.status !== "success") {
        const iraqiData = await loginAgainst(SCRIPT_URL$1);
        if (iraqiData.status === "success") {
          data = iraqiData;
          targetSystem = "iraqi";
        }
      } else if (targetSystem === "iraqi") {
        targetSystem = "iraqi";
      }
      if (data.status !== "success") {
        const hardcodedUsers = {
          "owner": { pass: "mostang2021", role: "owner" },
          "admin": { pass: "shein4321", role: "admin" },
          "modertor": { pass: "shein1234", role: "moderator" },
          "delvery": { pass: "sheindelivery", role: "delivery" }
        };
        const user = hardcodedUsers[normalizedUsername];
        if (user && user.pass === password) {
          data = { status: "success", role: user.role };
          targetSystem = "kurdistani";
        } else {
          data = { status: "error", message: "Invalid username or password" };
        }
      }
      if (data.status === "success") {
        if (targetSystem === "iraqi") {
          localStorage.setItem("iraqi_auth_role", data.role);
          localStorage.setItem("iraqi_auth_username", normalizedUsername);
          window.location.href = "/iraqi";
          return;
        }
        localStorage.setItem("auth_role", data.role);
        localStorage.setItem("auth_username", normalizedUsername);
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
const Index = () => {
  const [role, setRole] = reactExports.useState(() => localStorage.getItem("auth_role"));
  const [activeTab, setActiveTab] = reactExports.useState(() => localStorage.getItem("app_activeTab") || "orders");
  const [currentSystem, setCurrentSystem] = reactExports.useState(() => {
    const saved = localStorage.getItem("app_currentSystem");
    return saved === "all" || saved === "kurdistani" ? saved : "kurdistani";
  });
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
    const saved = localStorage.getItem("app_activeYear");
    return saved && YEARS_CONFIG[saved] ? saved : DEFAULT_YEAR;
  });
  const [activeMonth, setActiveMonth] = reactExports.useState(() => {
    const saved = localStorage.getItem("app_activeMonth");
    return saved && ALL_MONTHS.includes(saved) ? saved : DEFAULT_MONTH;
  });
  const [viewingMonth, setViewingMonth] = reactExports.useState(() => {
    const saved = localStorage.getItem("app_viewingMonth");
    return saved && ALL_MONTHS.includes(saved) ? saved : DEFAULT_MONTH;
  });
  reactExports.useEffect(() => {
    localStorage.setItem("app_activeTab", activeTab);
  }, [activeTab]);
  reactExports.useEffect(() => {
    localStorage.setItem("app_currentSystem", currentSystem);
  }, [currentSystem]);
  reactExports.useEffect(() => {
    localStorage.setItem("app_activeYear", activeYear);
  }, [activeYear]);
  reactExports.useEffect(() => {
    localStorage.setItem("app_activeMonth", activeMonth);
  }, [activeMonth]);
  reactExports.useEffect(() => {
    localStorage.setItem("app_viewingMonth", viewingMonth);
  }, [viewingMonth]);
  const [allOrders, setAllOrders] = reactExports.useState([]);
  const [monthlyStats, setMonthlyStats] = reactExports.useState({});
  const [loading, setLoading] = reactExports.useState(true);
  const [loadedMonths, setLoadedMonths] = reactExports.useState(/* @__PURE__ */ new Set());
  const [editingOrder, setEditingOrder] = reactExports.useState(null);
  const [selectedOrder, setSelectedOrder] = reactExports.useState(null);
  const [searchQuery, setSearchQuery] = reactExports.useState(() => localStorage.getItem("app_searchQuery") || "");
  const [isSearchingAll, setIsSearchingAll] = reactExports.useState(false);
  const [showCalculator, setShowCalculator] = reactExports.useState(false);
  const [showCameraSearch, setShowCameraSearch] = reactExports.useState(false);
  reactExports.useEffect(() => {
    localStorage.setItem("app_searchQuery", searchQuery);
  }, [searchQuery]);
  reactExports.useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem("app_scrollY", window.scrollY.toString());
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  reactExports.useEffect(() => {
    if (!loading) {
      const scrollY = sessionStorage.getItem("app_scrollY");
      if (scrollY) {
        setTimeout(() => window.scrollTo({ top: parseInt(scrollY), behavior: "instant" }), 0);
      }
    }
  }, [loading]);
  const loadedMonthsRef = reactExports.useRef(loadedMonths);
  loadedMonthsRef.current = loadedMonths;
  reactExports.useEffect(() => {
    if (!localStorage.getItem("app_activeTab")) {
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
      if (!localStorage.getItem("app_viewingMonth") || !ALL_MONTHS.includes(localStorage.getItem("app_viewingMonth") || "")) {
        setViewingMonth(scriptActiveSheet);
      }
      if (!localStorage.getItem("app_activeYear") || !YEARS_CONFIG[localStorage.getItem("app_activeYear") || ""]) setActiveYear(DEFAULT_YEAR);
    }
    if (json.data?.length) {
      const sheet = json.data[0].sheet_name;
      setAllOrders((prev) => mergeOrders(prev, json.data, sheet));
      setLoadedMonths((prev) => new Set(prev).add(sheet));
    }
  }, [mergeOrders]);
  const fetchInitialData = reactExports.useCallback(async () => {
    if (!role) return;
    const cached = localStorage.getItem("app_initial_data");
    let hasCached = false;
    if (cached) {
      try {
        const json = JSON.parse(cached);
        applyApiResponse(json, false);
        hasCached = true;
        setLoading(false);
      } catch (e) {
        console.warn("Cache error", e);
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
        localStorage.setItem("app_initial_data", JSON.stringify(json));
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
    const cacheKey = `app_month_data_${month}`;
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
    if (!loading && Object.keys(monthlyStats).length > 0) loadAllHistory();
  }, [loading, monthlyStats, loadAllHistory]);
  const forceRefreshMonth = reactExports.useCallback(async (month) => {
    if (!role) return;
    localStorage.removeItem(`app_month_data_${month}`);
    localStorage.removeItem("app_initial_data");
    try {
      const resMain = await fetchWithRetry(`${SCRIPT_URL}?t=${Date.now()}`);
      const textMain = await resMain.text();
      let jsonMain = null;
      try {
        jsonMain = JSON.parse(textMain);
      } catch (e) {
      }
      if (jsonMain && jsonMain.status === "success") {
        localStorage.setItem("app_initial_data", JSON.stringify(jsonMain));
        setMonthlyStats(jsonMain.meta.monthly_stats || {});
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
        localStorage.setItem(`app_month_data_${month}`, JSON.stringify(jsonMonth));
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
      try {
        const ctrl = new AbortController();
        (silentRefresh._ctrls ||= {})[target] = ctrl;
        const res = await fetch(`${SCRIPT_URL}?month=${target}&skip_stats=true&t=${Date.now()}`, { credentials: "omit", signal: ctrl.signal });
        const text = await res.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (e) {
        }
        if (json && json.status === "success") {
          localStorage.setItem(`app_month_data_${target}`, JSON.stringify(json));
          setMonthlyStats((prev) => ({ ...prev, ...json.meta.monthly_stats }));
          if (json.data?.length) {
            setAllOrders((prev) => mergeOrders(prev, json.data, target));
            setLoadedMonths((prev) => new Set(prev).add(target));
          }
        }
      } catch (_) {
      } finally {
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
      broadcastOrderChange({}, sheetName, id, "delete");
      recordOrderDeleted("kurdistani", sheetName, id).catch((err) => console.warn("Failed to update team delete stats", err));
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
    if (payload) {
      const idToFind = payload.row_id || (rowIdStr ? parseInt(rowIdStr.replace(/\D/g, "")) : Date.now());
      broadcastOrderChange(payload, payload.sheet || viewingMonth, idToFind, "upsert");
    }
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
      broadcastOrderChange({ ...order, extra: newExtra }, order.sheet_name, order.id, "upsert");
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
    }, 900);
    return () => clearInterval(interval);
  }, [silentRefresh, role]);
  reactExports.useEffect(() => {
    if (!role) return;
    const unsub = subscribeOrderChanges(({ payload, sheet, row_id, action }) => {
      if (!sheet) return;
      const id = typeof row_id === "string" ? parseInt(row_id) || row_id : row_id;
      setAllOrders((prev) => {
        if (action === "delete") {
          return prev.filter((o) => !(o.id === id && o.sheet_name === sheet));
        }
        const exists = prev.some((o) => o.id === id && o.sheet_name === sheet);
        if (exists) {
          return prev;
        }
        return [{ id, sheet_name: sheet, ...payload }, ...prev];
      });
    });
    return () => unsub();
  }, [role]);
  reactExports.useEffect(() => {
    if (!role) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") silentRefresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [silentRefresh, role]);
  const filteredOrders = reactExports.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list;
    if (q === "pending") list = allOrders.filter((o) => o.sheet_name === viewingMonth && getOrderStatus(o) === "pending");
    else if (q === "pic") list = allOrders.filter((o) => o.imageBase64 || o.image_url || o.primary_urls || o.warningBase64 || o.proof_urls?.length || o.secondaryImages?.length);
    else if (q) {
      const qDigits = q.replace(/\D/g, "");
      const qStripped = qDigits.replace(/^0+/, "");
      list = allOrders.filter((o) => [o.insta, o.name, o.phone, o.phone2, o.place, o.orderNo, o.extra, o.link, o.sku, o.sheet_name].some((f) => {
        const s = String(f || "").toLowerCase();
        if (s.includes(q)) return true;
        if (qStripped) {
          const sDigits = s.replace(/\D/g, "").replace(/^0+/, "");
          if (sDigits && sDigits.includes(qStripped)) return true;
        }
        return false;
      }));
    } else list = allOrders.filter((o) => o.sheet_name === viewingMonth);
    return list.sort(globalSort);
  }, [allOrders, viewingMonth, searchQuery]);
  const deliveryOrders = reactExports.useMemo(() => {
    const allArrived = allOrders.filter((o) => getOrderStatus(o) === "arrived" || String(o.note || "").includes("[DELIVERY_SCANNED]") || String(o.extra || "").includes("[DELIVERY_SCANNED]"));
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allArrived.sort(globalSort);
    const qDigits = q.replace(/\D/g, "");
    const qStripped = qDigits.replace(/^0+/, "");
    return allArrived.filter((o) => [o.insta, o.name, o.phone, o.phone2, o.place, o.orderNo, o.extra, o.link, o.sku, o.sheet_name].some((f) => {
      const s = String(f || "").toLowerCase();
      if (s.includes(q)) return true;
      if (qStripped) {
        const sDigits = s.replace(/\D/g, "").replace(/^0+/, "");
        if (sDigits && sDigits.includes(qStripped)) return true;
      }
      return false;
    })).sort(globalSort);
  }, [allOrders, searchQuery]);
  const availableMonths = reactExports.useMemo(() => (YEARS_CONFIG[activeYear] || []).filter((m) => monthlyStats[m]?.count > 0), [activeYear, monthlyStats]);
  reactExports.useEffect(() => {
    const yearMonths = YEARS_CONFIG[activeYear] || [];
    if (yearMonths.length > 0 && !yearMonths.includes(viewingMonth)) {
      setViewingMonth(availableMonths[0] || yearMonths[0]);
    }
  }, [activeYear, availableMonths, viewingMonth]);
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
        return /* @__PURE__ */ jsxRuntimeExports.jsx(MessagesView, { role, allOrders, profileMode: currentSystem });
      case "team":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(TeamView, { role, allOrders, currentUser: localStorage.getItem("auth_username") || role, profileMode: currentSystem, onOrderClick: setSelectedOrder });
      default:
        return null;
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("auth_role");
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { role, onLogout: handleLogout, onNotificationClick: handleNotificationClick, activeTab, setActiveTab, searchQuery, setSearchQuery, isSearchingAll, onSearchAll: () => setShowCalculator(true), onCameraSearch: () => setShowCameraSearch(true), viewingMonth, setViewingMonth, activeYear, setActiveYear, availableMonths, currentSystem, onSystemChange: setCurrentSystem, children: renderContent() }),
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
    showCalculator && /* @__PURE__ */ jsxRuntimeExports.jsx(CalculatorModal, { monthlyStats, onClose: () => setShowCalculator(false) }),
    showCameraSearch && /* @__PURE__ */ jsxRuntimeExports.jsx(CameraSearchModal, { allOrders, onOrderClick: (o) => {
      setShowCameraSearch(false);
      setSelectedOrder(o);
    }, onClose: () => setShowCameraSearch(false) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalCalculatorButton, {})
  ] });
};
const NotFound = () => {
  const location = distExports.useLocation();
  reactExports.useEffect(() => {
    console.warn("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-4 text-4xl font-bold", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-xl text-muted-foreground", children: "Oops! Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/", className: "text-primary underline hover:text-primary/90", children: "Return to Home" })
  ] }) });
};
const queryClient = new QueryClient();
const App = () => /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TooltipProvider, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster$1, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsx(distExports.BrowserRouter, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(distExports.Routes, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(distExports.Route, { path: "/", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Index, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(distExports.Route, { path: "*", element: /* @__PURE__ */ jsxRuntimeExports.jsx(NotFound, {}) })
  ] }) })
] }) });
export {
  App as default
};
