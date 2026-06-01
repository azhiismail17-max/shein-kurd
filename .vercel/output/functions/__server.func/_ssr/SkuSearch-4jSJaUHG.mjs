import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as fetchWithRetry } from "./notifications-DZXkXpOb.mjs";
import { R as ScanBarcode, a9 as X, T as Search, t as LoaderCircle, n as CircleCheck, E as ExternalLink } from "../_libs/lucide-react.mjs";
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
export {
  SkuSearch as S
};
