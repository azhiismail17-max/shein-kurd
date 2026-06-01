import { r as reactExports, a as React__default, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as Calculator, a9 as X, a5 as Upload, g as Check, p as Copy } from "../_libs/lucide-react.mjs";
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
    workerPromise = import("../_libs/tesseract.js.mjs").then(function(n) {
      return n.i;
    }).then(
      ({ default: Tesseract }) => Tesseract.createWorker("eng")
    );
  }
  return workerPromise;
};
function GlobalCalculatorButton({ onOpenPriceCalc }) {
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const handleClick = () => {
    if (onOpenPriceCalc) {
      onOpenPriceCalc();
      return;
    }
    setIsOpen(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: handleClick,
        className: "fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:shadow-xl hover:scale-105 active:scale-95 transition-all",
        title: "Price Calc",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { size: 24 })
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalCalculator, { onClose: () => setIsOpen(false) })
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
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50",
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
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
  GlobalCalculator,
  GlobalCalculatorButton,
  GlobalCalculator as default
};
