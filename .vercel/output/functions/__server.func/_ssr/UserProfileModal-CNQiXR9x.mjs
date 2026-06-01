import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { g as getUserStatsForProfile, p as parseOrderPrice, S as SOURCE_STYLES, B as Button } from "./combinedProfile-1uPdsXSI.mjs";
import { aD as onSnapshot, U as collection } from "../_libs/firebase__firestore.mjs";
import { e as db } from "./use-toast-CUyDYyz5.mjs";
import { a9 as X, a6 as User, P as Package, A as Activity, B as Banknote, w as MessageCircle } from "../_libs/lucide-react.mjs";
function UserProfileModal({ userTarget, onClose, onMessage, allOrders, canDelete, canViewOrders = true, profileMode = "iraqi", onOrderClick }) {
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
  const recentOrders = canViewOrders ? stats.recentOrders.filter((order) => allOrders.some((o) => String(o.id) === String(order.id) && o.sheet_name === order.sheet)) : [];
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
      canViewOrders && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mt-6", children: [
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
      canViewOrders && profileMode === "all" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 mt-3", children: bySource.map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-3 ${SOURCE_STYLES[entry.source].badge}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-bold uppercase tracking-wider", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-2.5 w-2.5 rounded-full ${SOURCE_STYLES[entry.source].dot}` }),
          SOURCE_STYLES[entry.source].label
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-sm font-semibold", children: [
          entry.totalOrders,
          " orders"
        ] })
      ] }, entry.source)) }),
      canViewOrders && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
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
            className: `w-full border rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-accent ${profileMode === "all" ? `border-l-4 ${SOURCE_STYLES[order.source].row}` : "bg-card"}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold truncate", children: [
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
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold", children: [
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
export {
  UserProfileModal as U
};
