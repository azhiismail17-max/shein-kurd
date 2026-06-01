import { a as React__default, r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { YEARS_CONFIG } from "./index-CHMLBzfP.mjs";
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
export {
  MonthSelector as M
};
