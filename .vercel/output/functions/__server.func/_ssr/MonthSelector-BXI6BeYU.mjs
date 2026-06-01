import { a as React__default, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { Y as YEARS_CONFIG } from "./use-toast-CUyDYyz5.mjs";
const MonthSelector = React__default.memo(({ viewingMonth, setViewingMonth, activeYear, setActiveYear, availableMonths }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: Object.keys(YEARS_CONFIG).sort((a, b) => b.localeCompare(a)).map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveYear(y), className: `px-2 py-1 rounded text-[10px] font-bold transition-all ${activeYear === y ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`, children: y }, y)) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 overflow-x-auto no-scrollbar", children: availableMonths.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewingMonth(m), className: `shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${viewingMonth === m ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`, children: m }, m)) })
] }));
MonthSelector.displayName = "MonthSelector";
export {
  MonthSelector as M
};
