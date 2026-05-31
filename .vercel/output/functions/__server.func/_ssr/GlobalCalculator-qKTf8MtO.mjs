import { r as reactExports, j as jsxRuntimeExports, a as React__default } from "../_libs/react.mjs";
import { c as Root2, T as Trigger, P as Portal2, a as Content2, L as Label2, S as Separator2, I as Item2, e as SubTrigger2, d as SubContent2, C as CheckboxItem2, b as ItemIndicator2, R as RadioItem2 } from "../_libs/radix-ui__react-dropdown-menu.mjs";
import { S as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { al as getDocs, U as collection, aZ as updateDoc, aq as increment, a5 as doc, ar as initializeFirestore, aR as setDoc, M as arrayUnion } from "../_libs/firebase__firestore.mjs";
import "../_libs/firebase.mjs";
import { a as getStorage } from "../_libs/firebase__storage.mjs";
import { T as Tesseract } from "../_libs/tesseract.js.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
import { C as Calculator, J as Palette, g as Check, G as Globe, h as ChevronDown, t as LoaderCircle, a9 as X, a5 as Upload, p as Copy, j as ChevronRight, l as Circle } from "../_libs/lucide-react.mjs";
import { i as initializeApp } from "../_libs/firebase__app.mjs";
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
import "../_libs/firebase__component.mjs";
import "../_libs/firebase__util.mjs";
import "../_libs/firebase__webchannel-wrapper.mjs";
import "../_libs/firebase__logger.mjs";
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
import "../_libs/idb.mjs";
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
const YEARS_CONFIG$1 = {
  "2026": ["Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"]
};
const ACTIVE_ORDER_SHEET$1 = "Jun";
const SCRIPT_URL$1 = "https://script.google.com/macros/s/AKfycbwYc-fXYeZv8iQd4zyMExvSHZ3lsVtPVSbgfkmn37s5sE-cnvGjufYvdXWJXTiu23Q/exec";
const VERIFIED_KEY$1 = "iraqi_shein_verified_orders";
const MISSING_KEY$1 = "iraqi_shein_missing_orders";
function getVerifiedSet$1() {
  try {
    return new Set(JSON.parse(localStorage.getItem(VERIFIED_KEY$1) || "[]"));
  } catch {
    return /* @__PURE__ */ new Set();
  }
}
function saveVerifiedSet$1(s) {
  localStorage.setItem(VERIFIED_KEY$1, JSON.stringify([...s]));
}
function getMissingSet$1() {
  try {
    return new Set(JSON.parse(localStorage.getItem(MISSING_KEY$1) || "[]"));
  } catch {
    return /* @__PURE__ */ new Set();
  }
}
function saveMissingSet$1(s) {
  localStorage.setItem(MISSING_KEY$1, JSON.stringify([...s]));
}
const MISSING_LOGS_KEY$1 = "iraqi_shein_missing_images";
function getMissingImages$1() {
  try {
    return JSON.parse(localStorage.getItem(MISSING_LOGS_KEY$1) || "{}");
  } catch {
    return {};
  }
}
function saveMissingImages$1(data) {
  localStorage.setItem(MISSING_LOGS_KEY$1, JSON.stringify(data));
}
function getOrderStatus$1(order) {
  const extraVal = String(order.extra || "").trim();
  const extraMatch = extraVal.match(/\[(PENDING|APPROVED|ARRIVED|CANCELLED)\]/i);
  if (extraMatch) return extraMatch[1].toLowerCase();
  const noteVal = String(order.note || "").trim();
  const noteMatch = noteVal.match(/\[(PENDING|APPROVED|ARRIVED|CANCELLED)\]/i);
  if (noteMatch) return noteMatch[1].toLowerCase();
  return "pending";
}
const STATUS_COLORS$1 = {
  pending: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  approved: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  arrived: "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
  cancelled: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
};
const STATUS_ROW_COLORS$1 = {
  pending: "",
  approved: "",
  arrived: "bg-sky-50/50 dark:bg-sky-500/5",
  cancelled: "bg-red-50/50 dark:bg-red-500/5"
};
async function ensureBrowserNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "default") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}
async function showBrowserNotification(title, options = {}) {
  if (!("Notification" in window)) return;
  const allowed = await ensureBrowserNotificationPermission();
  if (!allowed) return;
  const payload = {
    body: options.body,
    icon: options.icon || "/logo.jpg",
    badge: "/logo.jpg",
    tag: options.tag
  };
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.showNotification) {
      await registration.showNotification(title, payload);
      return;
    }
  }
  new Notification(title, payload);
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const DropdownMenu = Root2;
const DropdownMenuTrigger = Trigger;
const DropdownMenuSubTrigger = reactExports.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  SubTrigger2,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[state=open]:bg-accent focus:bg-accent",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "ml-auto h-4 w-4" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
const DropdownMenuSubContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  SubContent2,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = SubContent2.displayName;
const DropdownMenuContent = reactExports.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = Content2.displayName;
const DropdownMenuItem = reactExports.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Item2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = Item2.displayName;
const DropdownMenuCheckboxItem = reactExports.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  CheckboxItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
const DropdownMenuRadioItem = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  RadioItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
const DropdownMenuLabel = reactExports.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Label2,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
    ...props
  }
));
DropdownMenuLabel.displayName = Label2.displayName;
const DropdownMenuSeparator = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Separator2, { ref, className: cn("-mx-1 my-1 h-px bg-muted", className), ...props }));
DropdownMenuSeparator.displayName = Separator2.displayName;
const OPTIONS = [
  { key: "all", label: "ALL", sub: "Unified view" },
  { key: "kurdistani", label: "Kurdistani", sub: "Shein Kurdistani" },
  { key: "iraqi", label: "Iraqi", sub: "Shein Iraqi" }
];
const SWITCH_LABELS = {
  all: "ALL",
  kurdistani: "Kurdistani",
  iraqi: "Iraqi"
};
const SystemSwitcher = ({ role, current = "kurdistani", onChange }) => {
  const [active, setActive] = reactExports.useState(current);
  const [switching, setSwitching] = reactExports.useState(null);
  reactExports.useEffect(() => {
    setActive(current);
  }, [current]);
  const handleSelect = (key) => {
    if (key === active && key !== "all") return;
    if (key === "iraqi") {
      setSwitching("iraqi");
      setTimeout(() => {
        const username = localStorage.getItem("auth_username") || "owner";
        localStorage.setItem("iraqi_auth_role", role);
        localStorage.setItem("iraqi_auth_username", username);
        setActive("iraqi");
        setSwitching(null);
        onChange?.("iraqi");
        window.location.href = "/iraqi";
      }, 450);
      return;
    }
    if (key === "all") {
      setSwitching("all");
      const username = localStorage.getItem("iraqi_auth_username") || localStorage.getItem("auth_username") || role;
      localStorage.setItem("app_currentSystem", "all");
      localStorage.setItem("auth_role", role);
      localStorage.setItem("auth_username", username);
      setTimeout(() => {
        setActive("all");
        setSwitching(null);
        onChange?.("all");
        if (window.location.pathname.startsWith("/iraqi")) {
          window.location.href = "/";
        }
      }, 900);
      return;
    }
    setActive(key);
    onChange?.(key);
    if (key === "kurdistani") {
      const username = localStorage.getItem("iraqi_auth_username") || localStorage.getItem("auth_username") || role;
      localStorage.setItem("auth_role", role);
      localStorage.setItem("auth_username", username);
      localStorage.setItem("app_currentSystem", "kurdistani");
      window.location.href = "/";
    }
  };
  const activeOpt = OPTIONS.find((o) => o.key === active);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-xs sm:text-sm font-medium hover:border-primary/50 hover:bg-secondary/80 transition-all", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { size: 14, className: "text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: activeOpt.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 14, className: "text-muted-foreground" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-56", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Switch System" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
        OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DropdownMenuItem,
          {
            onClick: () => handleSelect(opt.key),
            className: "flex items-center justify-between gap-2 py-2.5 cursor-pointer",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: opt.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: opt.sub })
              ] }),
              active === opt.key && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16, className: "text-primary" })
            ]
          },
          opt.key
        ))
      ] })
    ] }),
    switching && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[100] bg-background/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-6 px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { size: 36, className: "text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 88, className: "absolute -inset-1 text-primary animate-spin", strokeWidth: 1.2 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-bold tracking-tight", children: [
          "Switching to ",
          SWITCH_LABELS[switching],
          " System"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Refreshing latest data..." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-primary animate-pulse" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:150ms]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:300ms]" })
      ] })
    ] }) })
  ] });
};
const STORAGE_KEY$1 = "shein_theme_color";
const COLORS = [
  { key: "default", label: "Profile Default", hsl: "", foreground: "", swatch: "linear-gradient(135deg, #10b981, #6b0f14)" },
  { key: "pink", label: "Pink", hsl: "330 81% 60%", foreground: "0 0% 100%", swatch: "#ec4899" },
  { key: "purple", label: "Purple", hsl: "262 83% 58%", foreground: "0 0% 100%", swatch: "#7c3aed" },
  { key: "light-blue", label: "Light Blue", hsl: "199 89% 48%", foreground: "0 0% 100%", swatch: "#0ea5e9" },
  { key: "red", label: "Red", hsl: "357 75% 24%", foreground: "0 0% 100%", swatch: "#6b0f14" },
  { key: "blue", label: "Blue", hsl: "221 83% 53%", foreground: "0 0% 100%", swatch: "#2563eb" },
  { key: "teal", label: "Teal", hsl: "173 80% 40%", foreground: "0 0% 100%", swatch: "#14b8a6" },
  { key: "amber", label: "Amber", hsl: "38 92% 50%", foreground: "222 47% 6%", swatch: "#f59e0b" },
  { key: "black", label: "Black", hsl: "220 15% 12%", foreground: "0 0% 100%", swatch: "#111827" }
];
function applyThemeColor(color) {
  const root = document.documentElement;
  const enabled = color.key !== "default";
  root.classList.toggle("user-accent-theme", enabled);
  if (!enabled) {
    root.style.removeProperty("--user-primary");
    root.style.removeProperty("--user-primary-foreground");
    return;
  }
  root.style.setProperty("--user-primary", color.hsl);
  root.style.setProperty("--user-primary-foreground", color.foreground);
}
function ThemeColorPicker({ compact = false }) {
  const [selectedKey, setSelectedKey] = reactExports.useState(() => localStorage.getItem(STORAGE_KEY$1) || "default");
  const selected = reactExports.useMemo(() => COLORS.find((color) => color.key === selectedKey) || COLORS[0], [selectedKey]);
  reactExports.useEffect(() => {
    applyThemeColor(selected);
  }, [selected]);
  const handleSelect = (color) => {
    setSelectedKey(color.key);
    localStorage.setItem(STORAGE_KEY$1, color.key);
    applyThemeColor(color);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: compact ? "p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors" : "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all",
        title: "Theme Color",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { size: 18 }),
          !compact && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Theme Color" }),
          !compact && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto h-4 w-4 rounded-full border border-border", style: { background: selected.swatch } })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-56", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Theme Color" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
      COLORS.map((color) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DropdownMenuItem,
        {
          onClick: () => handleSelect(color),
          className: "flex items-center justify-between gap-3 py-2.5 cursor-pointer",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-5 w-5 rounded-full border border-border shadow-sm", style: { background: color.swatch } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: color.label })
            ] }),
            selectedKey === color.key && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16, className: "text-primary" })
          ]
        },
        color.key
      ))
    ] })
  ] });
}
const projectId = "andazahoot-free";
const appId = "1:652973896584:web:7845e046e802d3bcdcc03d";
const apiKey = "AIzaSyBka4P5kgpZRlZd-OJ5dlbFce0-FDtRDUY";
const authDomain = "andazahoot-free.firebaseapp.com";
const firestoreDatabaseId = "ai-studio-98a2764b-1e73-49fa-86d9-1ef1d7b23f7b";
const storageBucket = "andazahoot-free.firebasestorage.app";
const messagingSenderId = "652973896584";
const measurementId = "";
const firebaseConfig = {
  projectId,
  appId,
  apiKey,
  authDomain,
  firestoreDatabaseId,
  storageBucket,
  messagingSenderId,
  measurementId
};
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, firebaseConfig.firestoreDatabaseId);
const storage = getStorage(app, `gs://${firebaseConfig.storageBucket}`);
const firebase = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  db,
  storage
}, Symbol.toStringTag, { value: "Module" }));
function normalizeTeamUsername(username) {
  return String(username || "unknown").trim().toLowerCase();
}
function getTeamStatsId(profile, username) {
  return `${profile}_${normalizeTeamUsername(username)}`;
}
function getTodayKey() {
  return (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Asia/Baghdad" });
}
function resolveTeamUsername(profile, role) {
  const stored = profile === "iraqi" ? localStorage.getItem("iraqi_auth_username") : localStorage.getItem("auth_username");
  const cleanStored = String(stored || "").trim().toLowerCase();
  const cleanRole = String(role || "").trim().toLowerCase();
  const roleNames = /* @__PURE__ */ new Set(["owner", "admin", "moderator", "modertor", "delivery", "delvery"]);
  if (cleanRole && roleNames.has(cleanStored) && cleanStored !== cleanRole) return cleanRole;
  return cleanStored || cleanRole || "unknown";
}
async function recordPresence(profile, username, role, isOnline) {
  const cleanUsername = String(username || role || "unknown").trim() || "unknown";
  await setDoc(doc(db, "user_stats", getTeamStatsId(profile, cleanUsername)), {
    username: cleanUsername,
    role,
    profile,
    isOnline,
    lastActive: (/* @__PURE__ */ new Date()).toISOString()
  }, { merge: true });
}
async function recordOrderCreated(profile, username, role, order) {
  const cleanUsername = String(username || role || "unknown").trim() || "unknown";
  const today = getTodayKey();
  const orderId = order.row_id || order.id || Date.now();
  const sheet = order.sheet || order.sheet_name || "";
  await setDoc(doc(db, "user_stats", getTeamStatsId(profile, cleanUsername)), {
    username: cleanUsername,
    role,
    profile,
    isOnline: true,
    lastActive: (/* @__PURE__ */ new Date()).toISOString(),
    lastOrderAt: (/* @__PURE__ */ new Date()).toISOString(),
    totalOrders: increment(1),
    [`dailyOrders.${today}`]: increment(1),
    recentOrders: arrayUnion({
      id: String(orderId),
      sheet: String(sheet),
      insta: String(order.insta || order.name || "Unknown"),
      price: String(order.price || ""),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    })
  }, { merge: true });
}
async function recordOrderDeleted(profile, sheet, rowId) {
  const today = getTodayKey();
  const snap = await getDocs(collection(db, "user_stats"));
  const updates = snap.docs.map(async (docSnap) => {
    const data = docSnap.data();
    if (data.profile !== profile || !Array.isArray(data.recentOrders)) return;
    const removed = data.recentOrders.filter((order) => String(order.id) === String(rowId) && String(order.sheet) === String(sheet));
    if (removed.length === 0) return;
    const remaining = data.recentOrders.filter((order) => !(String(order.id) === String(rowId) && String(order.sheet) === String(sheet)));
    const removedToday = removed.filter((order) => order.createdAt && new Date(order.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Baghdad" }) === today).length;
    await updateDoc(doc(db, "user_stats", docSnap.id), {
      recentOrders: remaining,
      totalOrders: increment(-removed.length),
      ...removedToday > 0 ? { [`dailyOrders.${today}`]: increment(-removedToday) } : {}
    });
  });
  await Promise.all(updates);
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = reactExports.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const Input = reactExports.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const YEARS_CONFIG = {
  "2025": ["April", "May", "Jun", "July", "Aug", "Sept", "Octo", "Nove", "Dece"],
  "2026": ["Jan", "Feb", "March", "Apr", "Mayy"]
};
const ACTIVE_ORDER_SHEET = "Mayy";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwWF-1pFpNaIq9qx2BrMVU5qiEduvrgnOiejDmdc0e975LPmbfCSIqzGsg6dR5mWBM/exec";
const VERIFIED_KEY = "shein_verified_orders";
const MISSING_KEY = "shein_missing_orders";
function getVerifiedSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(VERIFIED_KEY) || "[]"));
  } catch {
    return /* @__PURE__ */ new Set();
  }
}
function saveVerifiedSet(s) {
  localStorage.setItem(VERIFIED_KEY, JSON.stringify([...s]));
}
function getMissingSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(MISSING_KEY) || "[]"));
  } catch {
    return /* @__PURE__ */ new Set();
  }
}
function saveMissingSet(s) {
  localStorage.setItem(MISSING_KEY, JSON.stringify([...s]));
}
const MISSING_LOGS_KEY = "shein_missing_images";
function getMissingImages() {
  try {
    return JSON.parse(localStorage.getItem(MISSING_LOGS_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveMissingImages(data) {
  localStorage.setItem(MISSING_LOGS_KEY, JSON.stringify(data));
}
function getOrderStatus(order) {
  const extraVal = String(order.extra || "").trim();
  const extraMatch = extraVal.match(/\[(PENDING|APPROVED|ARRIVED|CANCELLED)\]/i);
  if (extraMatch) return extraMatch[1].toLowerCase();
  const noteVal = String(order.note || "").trim();
  const noteMatch = noteVal.match(/\[(PENDING|APPROVED|ARRIVED|CANCELLED)\]/i);
  if (noteMatch) return noteMatch[1].toLowerCase();
  return "pending";
}
const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  approved: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  arrived: "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
  cancelled: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
};
const STATUS_ROW_COLORS = {
  pending: "",
  approved: "",
  arrived: "bg-sky-50/50 dark:bg-sky-500/5",
  cancelled: "bg-red-50/50 dark:bg-red-500/5"
};
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ACTIVE_ORDER_SHEET,
  SCRIPT_URL,
  STATUS_COLORS,
  STATUS_ROW_COLORS,
  YEARS_CONFIG,
  getMissingImages,
  getMissingSet,
  getOrderStatus,
  getVerifiedSet,
  saveMissingImages,
  saveMissingSet,
  saveVerifiedSet
}, Symbol.toStringTag, { value: "Module" }));
const PROFILE_SOURCES = ["kurdistani", "iraqi"];
const SOURCE_STYLES = {
  kurdistani: {
    label: "Kurdistani",
    badge: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30",
    row: "border-l-sky-500 bg-sky-50/60 dark:bg-sky-500/10",
    dot: "bg-sky-500"
  },
  iraqi: {
    label: "Iraqi",
    badge: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
    row: "border-l-rose-500 bg-rose-50/60 dark:bg-rose-500/10",
    dot: "bg-rose-500"
  }
};
function parseOrderPrice(value) {
  return parseFloat(String(value || "").replace(/[^0-9.-]+/g, "")) || 0;
}
function getUserStatsForProfile(stats, username, profile) {
  const cleanUsername = normalizeTeamUsername(username);
  const today = getTodayKey();
  const sources = profile === "all" ? PROFILE_SOURCES : [profile];
  const bySource = sources.map((source) => {
    const sourceStats = stats[getTeamStatsId(source, cleanUsername)] || {};
    const recentOrders2 = Array.isArray(sourceStats.recentOrders) ? sourceStats.recentOrders.map((order) => ({
      id: String(order.id || ""),
      sheet: String(order.sheet || order.sheet_name || ""),
      insta: String(order.insta || order.name || "Unknown"),
      price: String(order.price || ""),
      createdAt: String(order.createdAt || ""),
      source
    })) : [];
    return {
      source,
      totalOrders: Number(sourceStats.totalOrders || 0),
      todayOrders: Number(sourceStats.dailyOrders?.[today] || 0),
      isOnline: sourceStats.isOnline === true && sourceStats.lastActive && Date.now() - new Date(sourceStats.lastActive).getTime() < 9e4,
      isActiveToday: sourceStats.lastActive ? new Date(sourceStats.lastActive).toDateString() === (/* @__PURE__ */ new Date()).toDateString() : false,
      recentOrders: recentOrders2
    };
  });
  const recentOrders = bySource.flatMap((entry) => entry.recentOrders).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  return {
    totalOrders: bySource.reduce((sum, entry) => sum + entry.totalOrders, 0),
    todayOrders: bySource.reduce((sum, entry) => sum + entry.todayOrders, 0),
    totalValue: recentOrders.reduce((sum, order) => sum + parseOrderPrice(order.price), 0),
    isOnline: bySource.some((entry) => entry.isOnline),
    isActiveToday: bySource.some((entry) => entry.isActiveToday),
    bySource,
    recentOrders
  };
}
function formatAuthUser(user) {
  if (typeof user === "string") {
    const username2 = user.trim();
    if (!username2) return null;
    return {
      username: username2,
      role: username2.includes(" ") ? username2.split(" ")[0] : username2
    };
  }
  const username = String(user.username || "").trim();
  if (!username) return null;
  return {
    username,
    role: String(user.role || "").trim()
  };
}
async function fetchCombinedAuthUsers(fetcher, profile = "all") {
  const urls = profile === "all" ? [SCRIPT_URL, SCRIPT_URL$1] : [profile === "iraqi" ? SCRIPT_URL$1 : SCRIPT_URL];
  const responses = await Promise.allSettled(urls.map((url) => fetcher(`${url}?action=get_auth_users`)));
  const users = /* @__PURE__ */ new Map();
  for (const response of responses) {
    if (response.status !== "fulfilled") continue;
    const text = await response.value.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      continue;
    }
    if (data.status !== "success" || !Array.isArray(data.users)) continue;
    for (const rawUser of data.users) {
      const formatted = formatAuthUser(rawUser);
      if (!formatted) continue;
      const key = normalizeTeamUsername(formatted.username);
      const existing = users.get(key);
      users.set(key, {
        username: existing?.username || formatted.username,
        role: existing?.role && existing.role !== existing.username ? existing.role : formatted.role
      });
    }
  }
  return [...users.values()].sort((a, b) => a.username.localeCompare(b.username));
}
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1e6;
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}
const toastTimeouts = /* @__PURE__ */ new Map();
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => t.id === action.toast.id ? { ...t, ...action.toast } : t)
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast2) => {
          addToRemoveQueue(toast2.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === toastId || toastId === void 0 ? {
            ...t,
            open: false
          } : t
        )
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === void 0) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      };
  }
};
const listeners = [];
let memoryState = { toasts: [] };
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
function toast({ ...props }) {
  const id = genId();
  const update = (props2) => dispatch({
    type: "UPDATE_TOAST",
    toast: { ...props2, id }
  });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });
  return {
    id,
    dismiss,
    update
  };
}
function useToast() {
  const [state, setState] = reactExports.useState(memoryState);
  reactExports.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index2 = listeners.indexOf(setState);
      if (index2 > -1) {
        listeners.splice(index2, 1);
      }
    };
  }, [state]);
  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId })
  };
}
const STORAGE_KEY = "shein_calculator_state";
const calculatorStore = {
  getState: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : getDefaultState();
    } catch {
      return getDefaultState();
    }
  },
  setState: (state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new CustomEvent("calculator-state-changed", { detail: state }));
    } catch {
      console.error("Failed to save calculator state");
    }
  },
  reset: () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("calculator-state-changed", { detail: getDefaultState() }));
  }
};
function getDefaultState() {
  return {
    manualRetail: "",
    manualPromo: "",
    manualItems: "",
    autoImage: null,
    autoRetail: null,
    autoPromo: null,
    autoItems: null,
    activeTab: "auto"
  };
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
function GlobalCalculatorButton() {
  const [isOpen, setIsOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.button,
      {
        whileHover: { scale: 1.1 },
        whileTap: { scale: 0.95 },
        onClick: () => setIsOpen(true),
        className: "fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:shadow-xl transition-shadow",
        title: "Open Calculator",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { size: 24 })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalCalculator, { onClose: () => setIsOpen(false) }) })
  ] });
}
function GlobalCalculator({ onClose }) {
  const initialState = calculatorStore.getState();
  const [state, setState] = reactExports.useState({
    ...initialState,
    activeTab: "auto"
    // Always start on auto/image upload tab
  });
  const [copyFeedback, setCopyFeedback] = reactExports.useState(null);
  const fileInputRef = React__default.useRef(null);
  reactExports.useEffect(() => {
    const handleStateChange = (e) => {
      setState((prev) => ({ ...e.detail, activeTab: "auto" }));
    };
    window.addEventListener("calculator-state-changed", handleStateChange);
    getWorker().catch(console.error);
    return () => {
      window.removeEventListener("calculator-state-changed", handleStateChange);
    };
  }, []);
  const updateState = (updates) => {
    const newState = { ...state, ...updates };
    setState(newState);
    calculatorStore.setState(newState);
  };
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
      updateState({ autoRetail: null, autoPromo: null, autoItems: null });
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
      let extractedItems = 0;
      const dollarMatches = text.match(/\$[\d.,]+/g) || [];
      if (dollarMatches.length >= 2) {
        extractedRetail = parseFloat(dollarMatches[0].replace(/[$,]/g, ""));
        extractedPromo = parseFloat(dollarMatches[1].replace(/[$,]/g, ""));
      }
      const numberMatches = text.match(/\d+/g) || [];
      if (numberMatches.length > 0) {
        extractedItems = parseInt(numberMatches[numberMatches.length - 1]);
      }
      const dataUrl2 = canvas.toDataURL("image/jpeg", 0.7);
      updateState({
        autoImage: dataUrl2,
        autoRetail: extractedRetail || void 0,
        autoPromo: extractedPromo || void 0,
        autoItems: extractedItems || void 0
      });
    } catch (error) {
      console.error("Image processing error:", error);
    }
  };
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(type);
    setTimeout(() => setCopyFeedback(null), 2e3);
  };
  const results = state.autoRetail !== null && state.autoPromo !== null ? calculateResults(state.autoRetail, state.autoPromo) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
      className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50",
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          onClick: (e) => e.stopPropagation(),
          className: "w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 bg-primary/10 rounded-lg text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { size: 18 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: "Global Calculator" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-dashed border-border rounded-lg p-8 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    ref: fileInputRef,
                    type: "file",
                    accept: "image/*",
                    onChange: (e) => {
                      if (e.target.files?.[0]) {
                        processImage(e.target.files[0]);
                      }
                    },
                    className: "hidden"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => fileInputRef.current?.click(),
                    className: "inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 16 }),
                      "Upload Receipt Image"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Upload a receipt to calculate price" })
              ] }) }),
              state.autoRetail !== null && results && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 p-4 bg-secondary rounded-lg border border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Total (USD)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-lg", children: [
                      "$",
                      results.totalUsd.toFixed(2)
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => handleCopy(results.totalUsd.toFixed(2), "usd"),
                        className: "p-1 text-muted-foreground hover:text-foreground transition-colors",
                        children: copyFeedback === "usd" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 16 })
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Total (IQD)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-lg", children: results.totalIqd.toLocaleString() }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => handleCopy(results.totalIqd.toLocaleString(), "iqd"),
                        className: "p-1 text-muted-foreground hover:text-foreground transition-colors",
                        children: copyFeedback === "iqd" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 16 })
                      }
                    )
                  ] })
                ] })
              ] })
            ] })
          ]
        }
      )
    }
  );
}
export {
  ACTIVE_ORDER_SHEET$1 as A,
  Button as B,
  recordOrderCreated as C,
  recordOrderDeleted as D,
  recordPresence as E,
  resolveTeamUsername as F,
  GlobalCalculatorButton as G,
  saveMissingImages$1 as H,
  Input as I,
  saveMissingImages as J,
  saveMissingSet$1 as K,
  saveMissingSet as L,
  saveVerifiedSet$1 as M,
  saveVerifiedSet as N,
  showBrowserNotification as O,
  storage as P,
  useToast as Q,
  SCRIPT_URL$1 as S,
  ThemeColorPicker as T,
  YEARS_CONFIG$1 as Y,
  ACTIVE_ORDER_SHEET as a,
  SCRIPT_URL as b,
  SOURCE_STYLES as c,
  STATUS_COLORS$1 as d,
  STATUS_COLORS as e,
  STATUS_ROW_COLORS$1 as f,
  STATUS_ROW_COLORS as g,
  SystemSwitcher as h,
  YEARS_CONFIG as i,
  cn as j,
  db as k,
  ensureBrowserNotificationPermission as l,
  fetchCombinedAuthUsers as m,
  firebase as n,
  getMissingImages$1 as o,
  getMissingImages as p,
  getMissingSet$1 as q,
  getMissingSet as r,
  getOrderStatus$1 as s,
  getOrderStatus as t,
  getUserStatsForProfile as u,
  getVerifiedSet$1 as v,
  getVerifiedSet as w,
  index as x,
  normalizeTeamUsername as y,
  parseOrderPrice as z
};
