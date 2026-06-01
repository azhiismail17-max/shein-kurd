import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { S as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { n as normalizeTeamUsername, l as getTodayKey, k as getTeamStatsId, d as cn, S as SCRIPT_URL$1 } from "./use-toast-CUyDYyz5.mjs";
import { SCRIPT_URL } from "./index-CHMLBzfP.mjs";
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
function dedupeRecentOrders(orders) {
  const byKey = /* @__PURE__ */ new Map();
  for (const order of orders) {
    const key = `${order.source}|${order.sheet}|${order.id}`;
    const existing = byKey.get(key);
    if (!existing || new Date(order.createdAt || 0).getTime() > new Date(existing.createdAt || 0).getTime()) {
      byKey.set(key, order);
    }
  }
  return [...byKey.values()].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}
function getUserStatsForProfile(stats, username, profile) {
  const cleanUsername = normalizeTeamUsername(username);
  const today = getTodayKey();
  const sources = profile === "all" ? PROFILE_SOURCES : [profile];
  const bySource = sources.map((source) => {
    const sourceStats = stats[getTeamStatsId(source, cleanUsername)] || {};
    const recentOrders2 = dedupeRecentOrders(Array.isArray(sourceStats.recentOrders) ? sourceStats.recentOrders.map((order) => ({
      id: String(order.id || ""),
      sheet: String(order.sheet || order.sheet_name || ""),
      insta: String(order.insta || order.name || "Unknown"),
      price: String(order.price || ""),
      createdAt: String(order.createdAt || ""),
      source
    })) : []);
    const todayOrders = recentOrders2.filter((order) => order.createdAt && new Date(order.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Baghdad" }) === today).length;
    return {
      source,
      totalOrders: recentOrders2.length,
      todayOrders,
      isOnline: sourceStats.isOnline === true && sourceStats.lastActive && Date.now() - new Date(sourceStats.lastActive).getTime() < 9e4,
      isActiveToday: sourceStats.lastActive ? new Date(sourceStats.lastActive).toDateString() === (/* @__PURE__ */ new Date()).toDateString() : false,
      recentOrders: recentOrders2
    };
  });
  const recentOrders = dedupeRecentOrders(bySource.flatMap((entry) => entry.recentOrders));
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
export {
  Button as B,
  SOURCE_STYLES as S,
  fetchCombinedAuthUsers as f,
  getUserStatsForProfile as g,
  parseOrderPrice as p
};
