import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { getOrderStatus } from "./index-CHMLBzfP.mjs";
import { M as MonthSelector } from "./MonthSelector-DbDMc4fl.mjs";
import { getCustomerTotalPrice } from "./order-utils-CgGk-Sl2.mjs";
import { Q as Plus, Z as ShoppingCart, o as Clock, P as Package, D as DollarSign, C as Calculator, a2 as TrendingUp } from "../_libs/lucide-react.mjs";
import { R as ResponsiveContainer, a as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, c as PieChart, P as Pie, b as Cell } from "../_libs/recharts.mjs";
import "../_libs/react-dom.mjs";
import "async_hooks";
import "stream";
import "util";
import "crypto";
import "../_libs/es-toolkit.mjs";
import "../_libs/clsx.mjs";
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
export {
  DashboardView as default
};
